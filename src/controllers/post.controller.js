const { Post, PostImage, User, Tag, Comment, Like, Bookmark, Rating } = require('../models')
const { Op, fn, col, literal } = require('sequelize')
const postService = require('../services/postService')
const notificationService = require('../services/notificationService')

exports.showCreate = async (req, res) => {
  try {
    const tags = await Tag.findAll()
    res.render('pages/post/create', {
      old: {},
      tags
    })
  } catch (err) {
    res.redirect('/home')
  }
}

exports.showPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: PostImage, as: 'images' },
        { model: User, as: 'User', attributes: ['id', 'username'] },
        { model: Tag, through: { attributes: [] } },
        { model: Like },
        { model: Bookmark },
        { model: Rating, as: 'Ratings' }
      ]
    })

    if (!post) {
      return res.status(404).render('pages/error', {
        message: 'Publicación no encontrada',
        errors: []
      })
    }

    const comments = await Comment.findAll({
      where: { PostId: post.id },
      include: [{ model: User, attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']]
    })

    const commentCount = comments.length
    const likeCount = await Like.count({ where: { PostId: post.id } })
    const isLiked = req.user ? await Like.findOne({ where: { PostId: post.id, UserId: req.user.id } }) : false
    const saveCount = await Bookmark.count({ where: { PostId: post.id } })
    const isSaved = req.user ? await Bookmark.findOne({ where: { PostId: post.id, UserId: req.user.id } }) : false

    // Datos de valoración
    const ratings = post.Ratings || []
    const ratingCount = ratings.length
    const ratingAvg = ratingCount > 0
      ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(1)
      : null
    const userRating = req.user
      ? ratings.find(r => r.UserId === req.user.id)?.value || null
      : null
    const isAuthor = req.user && post.User && req.user.id === post.User.id

    const errors = req.query.error ? [{ message: decodeURIComponent(req.query.error) }] : []
    const success = req.query.success ? decodeURIComponent(req.query.success) : null

    res.render('pages/post/show', {
      post,
      comments,
      commentCount,
      likeCount,
      isLiked: !!isLiked,
      saveCount,
      isSaved: !!isSaved,
      ratingAvg,
      ratingCount,
      userRating,
      isAuthor,
      errors,
      success
    })
  } catch (err) {
    console.error('❌ Error cargando publicación:', err)
    res.status(500).render('pages/error', {
      message: 'Error al cargar la publicación',
      errors: [{ message: err.message }]
    })
  }
}

exports.ratePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    const value = parseInt(req.body.value)

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Valoración inválida. Debe ser entre 1 y 5 estrellas.' })
    }

    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'User', attributes: ['id'] }]
    })

    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' })
    }

    // El autor no puede valorar su propia publicación
    if (post.UserId === userId) {
      return res.status(403).json({ success: false, message: 'No podés valorar tu propia publicación.' })
    }

    // Verificar si ya existe una valoración del usuario para este post
    const existingRating = await Rating.findOne({
      where: { UserId: userId, PostId: postId }
    })

    if (existingRating) {
      return res.status(409).json({ success: false, message: 'Ya valoraste esta publicación.' })
    }

    await Rating.create({ UserId: userId, PostId: postId, value })

    // Notificar al autor
    await notificationService.createNotification({
      receiverId: post.UserId,
      actorId: userId,
      type: 'POST_RATED',
      relatedId: postId
    })

    // Calcular nuevo promedio
    const allRatings = await Rating.findAll({ where: { PostId: postId } })
    const ratingCount = allRatings.length
    const ratingAvg = (allRatings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(1)

    return res.json({
      success: true,
      userRating: value,
      ratingAvg,
      ratingCount
    })
  } catch (err) {
    console.error('❌ Error en ratePost:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body
    const postId = req.params.id

    if (!content || content.trim().length === 0) {
      return res.redirect(`/posts/${postId}?error=El+comentario+no+puede+estar+vacío`)
    }

    const post = await Post.findByPk(postId)
    if (!post) {
      return res.redirect('/home?error=Publicación+no+encontrada')
    }

    if (!post.commentsEnabled) {
      return res.redirect(`/posts/${postId}?error=Los+comentarios+están+deshabilitados`)
    }

    await Comment.create({
      content: content.trim(),
      PostId: postId,
      UserId: req.user.id
    })

    await notificationService.createNotification({
      receiverId: post.UserId,
      actorId: req.user.id,
      type: 'COMMENT_CREATED',
      relatedId: postId
    })

    return res.redirect(`/posts/${postId}?success=Comentario+publicado`)
  } catch (err) {
    console.error('❌ Error creando comentario:', err)
    return res.redirect(`/posts/${req.params.id}?error=Error+al+publicar+comentario`)
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params

    const comment = await Comment.findByPk(commentId)
    if (!comment) {
      return res.redirect(`/posts/${id}?error=Comentario+no+encontrado`)
    }

    if (comment.UserId !== req.user.id) {
      return res.redirect(`/posts/${id}?error=No+tienes+permiso+para+eliminar+este+comentario`)
    }

    await comment.destroy()
    return res.redirect(`/posts/${id}?success=Comentario+eliminado`)
  } catch (err) {
    console.error('❌ Error eliminando comentario:', err)
    return res.redirect(`/posts/${req.params.id}?error=Error+al+eliminar+comentario`)
  }
}

exports.createPost = async (req, res) => {
  try {
    await postService.createPost(req)
    return res.redirect(`/profile/${req.user.username}?success=Publicación+creada+correctamente`)
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.render('pages/post/create', {
        errors: [{ message: 'La imagen es muy grande. Máximo 10MB por archivo.' }],
        old: req.body
      })
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.render('pages/post/create', {
        errors: [{ message: 'Máximo 5 imágenes por publicación.' }],
        old: req.body
      })
    }

    if (err.message === 'Usuario no autenticado') {
      return res.render('pages/auth/login', {
        errors: [{ message: 'Debes iniciar sesión para crear publicaciones' }],
        title: 'Iniciar Sesión'
      })
    }

    const tags = await Tag.findAll()

    res.render('pages/post/create', {
      errors: [{ message: err.message || 'Error al crear la publicación' }],
      old: req.body,
      tags
    })
  }
}

exports.showEditForm = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: PostImage, as: 'images' },
        { model: Tag }
      ]
    })

    if (!post || post.UserId !== req.user.id) {
      return res.redirect(`/profile/${req.user.username}`)
    }

    if (['reported', 'under_review', 'removed'].includes(post.status)) {
      return res.redirect(`/posts/${post.id}?error=Esta+publicación+se+encuentra+bajo+revisión+y+no+puede+ser+editada`)
    }

    const tags = await Tag.findAll()

    res.render('pages/post/edit', {
      post,
      tags,
      username: req.user.username,
      errors: [],
      old: {}
    })
  } catch (err) {
    return res.redirect(`/profile/${req.user.username}`)
  }
}

exports.updatePost = async (req, res) => {
  try {
    const postCheck = await Post.findByPk(req.params.id)
    if (postCheck && ['reported', 'under_review', 'removed'].includes(postCheck.status)) {
      return res.redirect(`/posts/${postCheck.id}?error=Esta+publicación+se+encuentra+bajo+revisión+y+no+puede+ser+editada`)
    }

    await postService.updatePost(req)
    res.redirect(`/profile/${req.user.username}?success=Publicación+actualizada+correctamente`)
  } catch (err) {
    const tags = await Tag.findAll()

    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: PostImage, as: 'images' },
        { model: Tag }
      ]
    }).catch(() => null)

    let errorMsg = err.message || 'Error al actualizar la publicación'
    if (err.code === 'LIMIT_FILE_SIZE') errorMsg = 'Una imagen es muy grande. Máximo 10MB por archivo.'
    if (err.code === 'LIMIT_FILE_COUNT') errorMsg = 'Has excedido el límite de imágenes permitidas.'

    res.render('pages/post/edit', {
      post: post || { id: req.params.id, title: req.body.title, description: req.body.description },
      tags,
      username: req.user.username,
      errors: [{ message: errorMsg }],
      old: req.body
    })
  }
}

exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req)
    return res.redirect(`/profile/${req.user.username}?success=Publicación+eliminada+correctamente`)
  } catch (err) {
    return res.redirect(`/profile/${req.user.username}?error=Error+al+eliminar`)
  }
}

exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada' })
    }

    const existingLike = await Like.findOne({
      where: { PostId: postId, UserId: userId }
    })

    let liked = false
    if (existingLike) {
      await existingLike.destroy()
      liked = false
    } else {
      await Like.create({ PostId: postId, UserId: userId })
      liked = true

      await notificationService.createNotification({
        receiverId: post.UserId,
        actorId: userId,
        type: 'POST_LIKED',
        relatedId: postId
      })
    }

    const likeCount = await Like.count({ where: { PostId: postId } })

    return res.json({
      success: true,
      liked,
      likeCount
    })
  } catch (err) {
    console.error('❌ Error en toggleLike:', err)
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
