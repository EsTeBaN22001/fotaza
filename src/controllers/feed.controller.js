const { Post, PostImage, User, Follow, Tag, Like, Bookmark } = require('../models')
const { Op } = require('sequelize')

exports.getFollowedFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 12
    const offset = (page - 1) * limit

    const following = await req.user.getFollowing()
    const followingIds = following.map(u => u.id)

    let posts = []
    if (followingIds.length > 0) {

      posts = await Post.findAll({
        where: {
          UserId: { [Op.in]: followingIds },
          status: 'approved'
        },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username']
          },
          {
            model: PostImage,
            as: 'images',
            attributes: ['id', 'url']
          },
          {
            model: Tag,
            through: { attributes: [] }
          },
          {
            model: Like
          },
          {
            model: Bookmark
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      })
    }

    const pagination = {
      page,
      limit,
      hasNext: posts.length === limit
    }

    res.render('pages/feed/index', {
      title: 'Publicaciones de usuarios que sigo',
      posts,
      pagination
    })
  } catch (err) {
    console.error('❌ Error cargando feed:', err)
    res.render('pages/feed/index', {
      title: 'Publicaciones de usuarios que sigo',
      posts: [],
      pagination: { page: 1, limit: 12, hasNext: false },
      errors: [{ message: 'No se pudieron cargar las publicaciones' }]
    })
  }
}
