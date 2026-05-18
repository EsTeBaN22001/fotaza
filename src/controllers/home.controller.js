const { Post, PostImage, User, Tag, Like, Bookmark } = require('../models')

exports.getHome = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: PostImage,
          as: 'images'
        },
        {
          model: User,
          as: 'User'
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
      limit: 20
    })

    res.render('pages/home', { posts })
  } catch (err) {
    res.status(500).render('pages/error', { message: 'Error cargando el feed' })
  }
}
