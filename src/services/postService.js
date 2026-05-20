const { Post, PostImage } = require('../models')
const { optimizeImage } = require('../utils/imageOptimizer')
const { applyWatermark } = require('../utils/watermarkService')

/**
 * Procesa un archivo de imagen: optimiza, aplica marca de agua si corresponde.
 * @param {Object} file - Archivo subido por multer
 * @param {string} license - 'copyright' | 'free'
 * @param {string|null} watermarkText - Texto de la marca de agua (solo si copyright)
 * @returns {Promise<{buffer, mimeType}>}
 */
const processImage = async (file, license = 'copyright', watermarkText = null) => {
  let optimizedBuffer = file.buffer
  let finalMimeType = file.mimetype

  try {
    // 1. Optimizar y convertir a WebP en memoria
    optimizedBuffer = await optimizeImage(file.buffer, {
      width: 1920,
      height: 1920,
      quality: 80
    })
    finalMimeType = 'image/webp'
    console.log(`✅ Imagen optimizada en memoria: ${file.originalname}`)
  } catch (optErr) {
    console.error(`⚠️ Fallo optimizando en memoria ${file.originalname}:`, optErr.message)
  }

  const originalData = optimizedBuffer
  let finalData = optimizedBuffer

  // 2. Aplicar marca de agua si la imagen tiene copyright y tiene texto de watermark
  if (license === 'copyright' && watermarkText && watermarkText.trim() !== '') {
    try {
      finalData = await applyWatermark(originalData, watermarkText.trim())
      console.log(`🔏 Marca de agua aplicada a: ${file.originalname}`)
    } catch (wmErr) {
      console.error(`⚠️ Fallo aplicando marca de agua a ${file.originalname}:`, wmErr.message)
    }
  }

  return { originalData, finalData, mimeType: finalMimeType }
}

exports.createPost = async req => {
  const { title, description, tags, commentsEnabled } = req.body
  const userId = req.user?.id

  if (!userId) {
    throw new Error('Usuario no autenticado')
  }
  if (!title || !description) {
    throw new Error('Título y descripción son obligatorios')
  }
  if (!req.files || req.files.length === 0) {
    throw new Error('Debes subir al menos una imagen')
  }

  // Parsear licencias y marcas de agua por imagen
  const licenses = req.body.license
    ? (Array.isArray(req.body.license) ? req.body.license : [req.body.license])
    : []
  const watermarks = req.body.watermark
    ? (Array.isArray(req.body.watermark) ? req.body.watermark : [req.body.watermark])
    : []

  const transaction = await Post.sequelize.transaction()

  try {
    const post = await Post.create(
      {
        title,
        description,
        UserId: userId,
        commentsEnabled: commentsEnabled === 'on'
      },
      { transaction }
    )

    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags]
      await post.setTags(tagIds, { transaction })
    }

    const imagesToSave = []

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const license = licenses[i] || 'copyright'
      const watermarkText = license === 'copyright' ? (watermarks[i] || null) : null

      const { originalData, finalData, mimeType } = await processImage(file, license, watermarkText)

      imagesToSave.push({
        filename: file.originalname,
        mimeType,
        imageData: finalData,
        originalData: originalData,
        license,
        watermark: watermarkText || null,
        PostId: post.id
      })
    }

    await PostImage.bulkCreate(imagesToSave, { transaction })

    await transaction.commit()

    return post
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

exports.updatePost = async req => {
  const { title, description, tags, commentsEnabled, removedImages } = req.body
  const postId = req.params.id
  const userId = req.user.id

  const post = await Post.findOne({
    where: { id: postId, UserId: userId },
    include: [{ model: PostImage, as: 'images' }]
  })

  if (!post) throw new Error('No tienes permiso o la publicación no existe')
  if (!title || !description) throw new Error('Título y descripción son obligatorios')

  const removedImagesArray = removedImages ? (Array.isArray(removedImages) ? removedImages : [removedImages]) : []
  const currentImageCount = post.images.length
  const removedImageCount = removedImagesArray.length
  const newImageCount = req.files ? req.files.length : 0

  if (currentImageCount - removedImageCount + newImageCount > 5) {
    const error = new Error('Máximo 5 imágenes permitidas')
    error.code = 'LIMIT_FILE_COUNT'
    throw error
  }

  if (currentImageCount - removedImageCount + newImageCount === 0) {
    throw new Error('La publicación debe tener al menos una imagen')
  }

  // Parsear licencias y marcas de agua para imágenes EXISTENTES
  const existingLicenses = req.body.existingLicense
    ? (Array.isArray(req.body.existingLicense) ? req.body.existingLicense : [req.body.existingLicense])
    : []
  const existingWatermarks = req.body.existingWatermark
    ? (Array.isArray(req.body.existingWatermark) ? req.body.existingWatermark : [req.body.existingWatermark])
    : []
  const existingImageIds = req.body.existingImageId
    ? (Array.isArray(req.body.existingImageId) ? req.body.existingImageId : [req.body.existingImageId])
    : []

  // Parsear licencias y marcas de agua para imágenes NUEVAS
  const newLicenses = req.body.license
    ? (Array.isArray(req.body.license) ? req.body.license : [req.body.license])
    : []
  const newWatermarks = req.body.watermark
    ? (Array.isArray(req.body.watermark) ? req.body.watermark : [req.body.watermark])
    : []

  const transaction = await Post.sequelize.transaction()

  try {
    await post.update({
      title,
      description,
      commentsEnabled: commentsEnabled === 'on'
    }, { transaction })

    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags]
      await post.setTags(tagIds, { transaction })
    } else {
      await post.setTags([], { transaction })
    }

    // Eliminar imágenes seleccionadas
    if (removedImagesArray.length > 0) {
      const imagesToRemove = post.images.filter(img => removedImagesArray.includes(img.id.toString()))
      for (const img of imagesToRemove) {
        await img.destroy({ transaction })
      }
    }

    // Actualizar licencia/watermark de imágenes existentes que no fueron eliminadas
    if (existingImageIds.length > 0) {
      for (let i = 0; i < existingImageIds.length; i++) {
        const imgId = existingImageIds[i]
        if (removedImagesArray.includes(imgId.toString())) continue

        const existingImg = post.images.find(img => img.id.toString() === imgId.toString())
        if (!existingImg) continue

        const newLicense = existingLicenses[i] || existingImg.license
        const newWatermarkText = newLicense === 'copyright' ? (existingWatermarks[i] || null) : null

        // Si cambió la licencia o el watermark, re-aplicar usando originalData
        if (newLicense !== existingImg.license || newWatermarkText !== existingImg.watermark) {
          let newImageData = existingImg.originalData || existingImg.imageData // Fallback si no hay originalData
          
          if (newLicense === 'copyright' && newWatermarkText && newWatermarkText.trim() !== '') {
            try {
              newImageData = await applyWatermark(newImageData, newWatermarkText.trim())
            } catch (err) {
              console.error('Error reaplicando watermark:', err.message)
            }
          }

          await existingImg.update({
            license: newLicense,
            watermark: newWatermarkText || null,
            imageData: newImageData
          }, { transaction })
        }
      }
    }

    // Procesar nuevas imágenes subidas
    if (req.files && req.files.length > 0) {
      const imagesToSave = []

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]
        const license = newLicenses[i] || 'copyright'
        const watermarkText = license === 'copyright' ? (newWatermarks[i] || null) : null

        const { originalData, finalData, mimeType } = await processImage(file, license, watermarkText)

        imagesToSave.push({
          filename: file.originalname,
          mimeType,
          imageData: finalData,
          originalData: originalData,
          license,
          watermark: watermarkText || null,
          PostId: post.id
        })
      }

      await PostImage.bulkCreate(imagesToSave, { transaction })
    }

    await transaction.commit()
    return post
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

exports.deletePost = async req => {
  const postId = req.params.id
  const userId = req.user.id

  const post = await Post.findOne({
    where: { id: postId, UserId: userId },
    include: [{ model: PostImage, as: 'images' }]
  })

  if (!post) throw new Error('Publicación no encontrada o sin permisos')

  const transaction = await Post.sequelize.transaction()
  try {
    await PostImage.destroy({ where: { PostId: postId }, transaction })
    await post.destroy({ transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    console.error('❌ Error eliminando post:', err)
    throw err
  }
}
