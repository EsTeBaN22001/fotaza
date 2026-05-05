const { Post, PostImage, User } = require('../models')
const path = require('path')
const fs = require('fs').promises
const { optimizeImage } = require('../utils/imageOptimizer')

exports.createPost = async req => {
  const { title, description } = req.body
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
        commentsEnabled: true
      },
      { transaction }
    )

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
