const { Post, PostImage } = require('../models')
const { optimizeImage } = require('../utils/imageOptimizer')

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

    for (const file of req.files) {
      let optimizedBuffer = file.buffer
      let finalMimeType = file.mimetype

      try {
        // Optimizar y convertir a WebP en memoria
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

      imagesToSave.push({
        filename: file.originalname,
        mimeType: finalMimeType,
        imageData: optimizedBuffer,
        license: 'copyright',
        watermark: null,
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

    // Eliminar imágenes seleccionadas de la base de datos
    if (removedImagesArray.length > 0) {
      const imagesToRemove = post.images.filter(img => removedImagesArray.includes(img.id.toString()))

      for (const img of imagesToRemove) {
        await img.destroy({ transaction })
      }
    }

    // Procesar nuevas imágenes subidas en memoria
    if (req.files && req.files.length > 0) {
      const imagesToSave = []

      for (const file of req.files) {
        let optimizedBuffer = file.buffer
        let finalMimeType = file.mimetype

        try {
          optimizedBuffer = await optimizeImage(file.buffer, {
            width: 1920,
            height: 1920,
            quality: 80
          })
          finalMimeType = 'image/webp'
          console.log(`✅ Nueva imagen optimizada en memoria: ${file.originalname}`)
        } catch (optErr) {
          console.error(`⚠️ Fallo optimizando en memoria ${file.originalname}:`, optErr.message)
        }

        imagesToSave.push({
          filename: file.originalname,
          mimeType: finalMimeType,
          imageData: optimizedBuffer,
          license: 'copyright',
          watermark: null,
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
    // Eliminar todas las imágenes asociadas en base de datos (se destruyen las filas, no hay archivos)
    await PostImage.destroy({ where: { PostId: postId }, transaction })
    await post.destroy({ transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    console.error('❌ Error eliminando post:', err)
    throw err
  }
}
