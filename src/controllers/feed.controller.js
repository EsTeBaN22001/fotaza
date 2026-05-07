const { Post, User, Follow } = require('../models')
const { Op } = require('sequelize')

exports.getFollowedFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 12
    const offset = (page - 1) * limit

    // IDs de usuarios que sigo
    const following = await req.user.getFollowing()
    const followingIds = following.map(u => u.id)

    let posts = []
    if (followingIds.length > 0) {
      // 🔹 Consulta para el feed de seguidos
      const posts = await Post.findAll({
        where: {
          UserId: { [Op.in]: followingIds } // ✅ Usa 'UserId', no 'author_id'
        },
        include: [
          {
            model: User,
            as: 'User', // ✅ Alias definido en tu asociación (con U mayúscula)
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      })
    }

    // ✅ IMPORTANTE: Construir objeto pagination SIEMPRE
    const pagination = {
      page,
      limit,
      hasNext: posts.length === limit // Si trajo el límite completo, hay más páginas
    }

    res.render('pages/feed/index', {
      // 👈 Verifica la ruta correcta de la vista
      title: 'Publicaciones de usuarios que sigo',
      posts,
      pagination // 👈 ¡Asegúrate de incluirlo!
    })
  } catch (err) {
    console.error(err)
    res.render('pages/feed/index', {
      posts: [],
      user: req.user,
      errors: [{ message: 'No se pudieron cargar tus publicaciones' }],
      success: null
    })
  }
}
