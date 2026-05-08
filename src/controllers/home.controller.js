const { Post, PostImage, User, Tag } = require('../models')

exports.getHome = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: PostImage,
          as: 'images' // ✅ Ya lo tenías bien
        },
        {
          model: User,
          as: 'User'
        },
        {
          model: Tag,
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    })

    res.render('pages/home', { posts })
  } catch (err) {
    res.status(500).render('pages/error', { message: 'Error cargando el feed' })
  }
}
