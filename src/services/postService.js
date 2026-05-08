const { Post, PostImage, User } = require('../models')
const path = require('path')
const fs = require('fs').promises
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

    // Asignar tags si existen
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags]
      await post.setTags(tagIds, { transaction })
    }

    const uploadDir = path.join(__dirname, '../public/uploads')
    const imagesToSave = []

    for (const file of req.files) {
      const originalPath = path.join(file.destination, file.filename)
      const baseName = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const optimizedFileName = `${baseName}.webp`
      const optimizedPath = path.join(uploadDir, optimizedFileName)

      let finalUrl = `/uploads/${file.filename}`

      try {
        await optimizeImage(originalPath, optimizedPath, {
          width: 1920,
          height: 1920,
          quality: 80
        })

        finalUrl = `/uploads/${optimizedFileName}`
        await fs.unlink(originalPath)
        console.log(`✅ Optimizada: ${file.originalname} → ${optimizedFileName}`)
      } catch (optErr) {
        console.error(`⚠️ Fallo optimizando ${file.originalname}:`, optErr.message)
      }

      imagesToSave.push({
        url: finalUrl,
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

    // Update tags
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags]
      await post.setTags(tagIds, { transaction })
    } else {
      await post.setTags([], { transaction }) // Clear tags if none selected
    }

    const uploadDir = path.join(__dirname, '../public/uploads')

    // Handle removed images
    if (removedImagesArray.length > 0) {
      const imagesToRemove = post.images.filter(img => removedImagesArray.includes(img.id.toString()))
      
      for (const img of imagesToRemove) {
        const fileName = path.basename(img.url)
        const filePath = path.join(uploadDir, fileName)
        
        if (await fs.stat(filePath).catch(() => false)) {
          await fs.unlink(filePath)
        }
        
        await img.destroy({ transaction })
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const imagesToSave = []

      for (const file of req.files) {
        const originalPath = path.join(file.destination, file.filename)
        const baseName = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const optimizedFileName = `${baseName}.webp`
        const optimizedPath = path.join(uploadDir, optimizedFileName)

        let finalUrl = `/uploads/${file.filename}`

        try {
          await optimizeImage(originalPath, optimizedPath, {
            width: 1920,
            height: 1920,
            quality: 80
          })

          finalUrl = `/uploads/${optimizedFileName}`
          await fs.unlink(originalPath)
        } catch (optErr) {
          console.error(`⚠️ Fallo optimizando ${file.originalname}:`, optErr.message)
        }

        imagesToSave.push({
          url: finalUrl,
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
    const uploadDir = path.join(__dirname, '../public/uploads')

    // 🗑️ Eliminar archivos del disco
    for (const img of post.images) {
      const fileName = path.basename(img.url)
      const filePath = path.join(uploadDir, fileName)
      if (await fs.stat(filePath).catch(() => false)) {
        await fs.unlink(filePath)
      }
    }

    // 🗑️ Eliminar registros en BD (cascada o manual)
    await PostImage.destroy({ where: { PostId: postId }, transaction })
    await post.destroy({ transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    console.error('❌ Error eliminando post:', err)
    throw err
  }
}
