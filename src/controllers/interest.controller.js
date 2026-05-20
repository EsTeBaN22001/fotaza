const { Post, PostImage, User, Interest } = require('../models')
const notificationService = require('../services/notificationService')

/**
 * Toggle de "Me interesa" en una publicación.
 * Al expresar interés, notifica al autor con perfil del interesado.
 */
exports.toggleInterest = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'User', attributes: ['id', 'username'] }]
    })

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' })
    }

    // El autor no puede expresar interés en su propia publicación
    if (post.UserId === userId) {
      return res.status(403).json({ success: false, message: 'No podés expresar interés en tu propia publicación.' })
    }

    const existing = await Interest.findOne({
      where: { UserId: userId, PostId: postId }
    })

    let interested = false

    if (existing) {
      await existing.destroy()
      interested = false
    } else {
      await Interest.create({ UserId: userId, PostId: postId })
      interested = true

      // Notificar al autor con tipo POST_INTEREST (incluye referencia al post)
      await notificationService.createNotification({
        receiverId: post.UserId,
        actorId: userId,
        type: 'POST_INTEREST',
        relatedId: postId
      })
    }

    const interestCount = await Interest.count({ where: { PostId: postId } })

    return res.json({
      success: true,
      interested,
      interestCount
    })
  } catch (err) {
    console.error('❌ Error en toggleInterest:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * Verifica si el usuario actual ya expresó interés en una publicación.
 */
exports.getInterestStatus = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const existing = await Interest.findOne({
      where: { UserId: userId, PostId: postId }
    })

    return res.json({ interested: !!existing })
  } catch (err) {
    console.error('❌ Error en getInterestStatus:', err)
    return res.status(500).json({ success: false, message: 'Error interno' })
  }
}
