const { Report, Post, PostImage, Comment, Notification } = require('../models')
const { Op } = require('sequelize')

exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body
    const reporterId = req.user.id

    if (!['post', 'postImage', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: 'Tipo de objetivo inválido' })
    }

    let targetOwnerId = null
    let targetPostId = null

    if (targetType === 'post') {
      const post = await Post.findByPk(targetId)
      if (!post) return res.status(404).json({ error: 'Post no encontrado' })
      targetOwnerId = post.UserId
      targetPostId = post.id
    } else if (targetType === 'postImage') {
      const image = await PostImage.findByPk(targetId, { include: [Post] })
      if (!image || !image.Post) return res.status(404).json({ error: 'Imagen no encontrada' })
      targetOwnerId = image.Post.UserId
      targetPostId = image.PostId
    } else if (targetType === 'comment') {
      const comment = await Comment.findByPk(targetId)
      if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' })
      targetOwnerId = comment.UserId
      targetPostId = comment.PostId
    }

    // 1. Evitar auto-reporte
    if (targetOwnerId === reporterId) {
      return res.status(403).json({ error: 'No puedes denunciar tu propio contenido' })
    }

    // 2. Evitar reporte duplicado
    const existingReport = await Report.findOne({
      where: { reporterId, targetType, targetId }
    })

    if (existingReport) {
      return res.status(409).json({ error: 'Ya has denunciado este contenido' })
    }

    // Crear reporte
    await Report.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description
    })

    // Si es sobre un post o imagen, aplicar reglas al Post
    if (targetType === 'post' || targetType === 'postImage') {
      const post = await Post.findByPk(targetPostId)
      
      // Bloquear modificación cambiando el estado a reported si estaba approved
      if (post.status === 'approved' || post.status === 'pending') {
        post.status = 'reported'
        await post.save()
      }

      // 4. Umbral de Moderación
      // Obtener todas las imágenes del post para contar reportes agrupados
      const postImages = await PostImage.findAll({ where: { PostId: targetPostId }, attributes: ['id'] })
      const imageIds = postImages.map(img => img.id)

      const uniqueReporters = await Report.count({
        col: 'reporterId',
        distinct: true,
        where: {
          [Op.or]: [
            { targetType: 'post', targetId: targetPostId },
            { targetType: 'postImage', targetId: { [Op.in]: imageIds } }
          ],
          status: 'pending' // Solo contar reportes activos
        }
      })

      if (uniqueReporters >= 3 && post.status !== 'under_review' && post.status !== 'removed') {
        post.status = 'under_review'
        await post.save()

        // Notificar al autor
        if (Notification) {
          await Notification.create({
            UserId: targetOwnerId,
            type: 'post_under_review',
            message: 'Una de tus publicaciones ha entrado en revisión debido a múltiples denuncias.',
            relatedId: targetPostId
          })
        }
      }
    } else if (targetType === 'comment') {
       if (Notification) {
          await Notification.create({
            UserId: targetOwnerId, // Notifica al autor del comentario
            type: 'comment_reported',
            message: 'Un comentario tuyo ha sido reportado.',
            relatedId: targetId
          })
        }
    }

    res.status(201).json({ message: 'Denuncia enviada correctamente', success: true })

  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({ error: 'Error interno al procesar la denuncia' })
  }
}
