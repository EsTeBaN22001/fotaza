const { Post, PostImage, User } = require('../models')

exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id

    const posts = await Post.findAll({
      where: { UserId: userId },
      include: [
        { model: PostImage, as: 'images', attributes: ['id', 'url'] },
        { model: User, as: 'User', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'DESC']]
    })

    // ✅ Leer mensajes de query params y convertirlos a formato que el layout entiende
    const errors = req.query.error ? [{ message: decodeURIComponent(req.query.error) }] : []
    const success = req.query.success ? decodeURIComponent(req.query.success) : null

    res.render('pages/profile', {
      posts,
      user: req.user,
      errors, // ✅ El layout lo mostrará automáticamente
      success // ✅ El layout lo mostrará automáticamente
    })
  } catch (err) {
    console.error('❌ Error cargando perfil:', err.message)
    res.render('pages/profile', {
      posts: [],
      user: req.user,
      errors: [{ message: 'No se pudieron cargar tus publicaciones' }],
      success: null
    })
  }
}
