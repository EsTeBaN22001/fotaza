const { Post, PostImage, User, Tag, Like, Bookmark } = require('../models')
const notificationService = require('../services/notificationService')

exports.toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' })
    }

    const existing = await Bookmark.findOne({
      where: { PostId: postId, UserId: userId }
    })

    let saved = false
    if (existing) {
      await existing.destroy()
      saved = false
    } else {
      await Bookmark.create({ PostId: postId, UserId: userId })
      saved = true

      await notificationService.createNotification({
        receiverId: post.UserId,
        actorId: userId,
        type: 'PUBLICATION_INTERESTED',
        relatedId: postId
      })
    }

    const saveCount = await Bookmark.count({ where: { PostId: postId } })

    return res.json({
      success: true,
      saved,
      saveCount
    })
  } catch (err) {
    console.error('❌ Error en toggleBookmark:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.getSaved = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { UserId: req.user.id },
      include: [{
        model: Post,
        include: [
          { model: PostImage, as: 'images' },
          { model: User, as: 'User', attributes: ['id', 'username'] },
          { model: Tag, through: { attributes: [] } },
          { model: Like },
          { model: Bookmark }
        ]
      }],
      order: [['created_at', 'DESC']]
    })

    const posts = bookmarks.map(b => b.Post).filter(Boolean)

    res.render('pages/saved', { posts })
  } catch (err) {
    console.error('❌ Error cargando guardados:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar tus publicaciones guardadas',
      errors: [],
      status: 500
    })
  }
}
