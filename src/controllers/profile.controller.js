const { Post, PostImage, User, Follow, Tag, Like, Bookmark } = require('../models')

exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id

    const posts = await Post.findAll({
      where: { UserId: userId },
      include: [
        { model: PostImage, as: 'images', attributes: ['id', 'url'] },
        { model: User, as: 'User', attributes: ['id', 'username'] },
        { model: Tag, through: { attributes: [] } },
        { model: Like },
        { model: Bookmark }
      ],
      order: [['created_at', 'DESC']]
    })

    const errors = req.query.error ? [{ message: decodeURIComponent(req.query.error) }] : []
    const success = req.query.success ? decodeURIComponent(req.query.success) : null

    res.render('pages/profile', {
      posts,
      user: req.user,
      errors,
      success
    })
  } catch (err) {
    res.render('pages/profile', {
      posts: [],
      user: req.user,
      errors: [{ message: 'No se pudieron cargar tus publicaciones' }],
      success: null
    })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const profileUser = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['password'] }
    })

    if (!profileUser) {
      return res.status(404).render('errors/404', { title: 'Usuario no encontrado' })
    }

    const followerCount = await profileUser.countFollowers()
    const followingCount = await profileUser.countFollowing()

    let isFollowing = false
    let isOwner = false

    if (req.user) {
      isOwner = req.user.id === profileUser.id
      if (!isOwner) {
        const follow = await Follow.findOne({
          where: { follower_id: req.user.id, following_id: profileUser.id }
        })
        isFollowing = !!follow
      }
    }

    const posts = await Post.findAll({
      where: { UserId: profileUser.id },
      include: [
        { model: PostImage, as: 'images', attributes: ['url', 'id'] },
        { model: Tag, through: { attributes: [] } },
        { model: Like },
        { model: Bookmark }
      ],
      order: [['created_at', 'DESC']],
      limit: 12
    })

    res.render('pages/profile/index', {
      title: profileUser.username,
      profileUser,
      posts,
      followerCount,
      followingCount,
      isOwner,
      isFollowing
    })
  } catch (err) {
    res.status(500).render('errors', {
      title: 'Error interno',
      message: 'No se pudo cargar el perfil. Revisa la consola del servidor para más detalles.'
    })
  }
}

exports.getFollowersList = async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (!user) return res.status(404).render('errors/404')

  const followers = await user.getFollowers({
    attributes: ['id', 'username'],
    order: [['created_at', 'DESC']]
  })

  res.render('pages/profile/follow-list', {
    title: `Seguidores de ${user.username}`,
    users: followers,
    type: 'followers',
    profileUser: user
  })
}

exports.getFollowingList = async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (!user) return res.status(404).render('errors/404')

  const following = await user.getFollowing({
    attributes: ['id', 'username'],
    order: [['created_at', 'DESC']]
  })

  res.render('pages/profile/follow-list', {
    title: `Siguiendo por ${user.username}`,
    users: following,
    type: 'following',
    profileUser: user
  })
}

exports.toggleFollow = async (req, res) => {
  try {
    const target = await User.findOne({ where: { username: req.params.username } })
    if (!target) return res.redirect('back')

    // ✅ Consigna: No auto-seguir
    if (req.user.id === target.id) {
      return res.redirect(`/profile/${req.params.username}?error=No+puedes+seguirte+a+ti+mismo`)
    }

    const existing = await Follow.findOne({
      where: { follower_id: req.user.id, following_id: target.id }
    })

    let message = ''

    if (existing) {
      await existing.destroy()
      message = `Has+dejado+de+seguir+a+${target.username}`
    } else {
      await Follow.create({ follower_id: req.user.id, following_id: target.id })
      message = `Ahora+sigues+a+${target.username}`

      // 🔔 Notificación (Requisito 5)
      await Notification.create({
        user_id: target.id,
        actor_id: req.user.id,
        type: 'new_follower',
        message: `@${req.user.username} comenzó a seguirte`,
        is_read: false
      })
    }

    return res.redirect(`/profile/${req.params.username}?success=${message}`)
  } catch (err) {
    return res.redirect(`/profile/${req.params.username}?error=Error+al+actualizar+seguimiento`)
  }
}
