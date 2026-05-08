const { Post, PostImage, User, Tag, Comment } = require('../models')
const postService = require('../services/postService')

exports.showCreate = (req, res) => {
  res.render('pages/createPost', {
    old: {}
  })
}

// 📄 Ver publicación individual
exports.showPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: PostImage, as: 'images' },
        { model: User, as: 'User', attributes: ['id', 'username'] }
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

    // Toast messages from query params
    const errors = req.query.error ? [{ message: decodeURIComponent(req.query.error) }] : []
    const success = req.query.success ? decodeURIComponent(req.query.success) : null

    res.render('pages/post/show', {
      post,
      comments,
      commentCount,
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

// 💬 Crear comentario
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

    return res.redirect(`/posts/${postId}?success=Comentario+publicado`)
  } catch (err) {
    console.error('❌ Error creando comentario:', err)
    return res.redirect(`/posts/${req.params.id}?error=Error+al+publicar+comentario`)
  }
}

// 🗑️ Eliminar comentario
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params

    const comment = await Comment.findByPk(commentId)
    if (!comment) {
      return res.redirect(`/posts/${id}?error=Comentario+no+encontrado`)
    }

    // Solo el dueño del comentario puede eliminarlo
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
      return res.render('pages/createPost', {
        errors: [{ message: 'La imagen es muy grande. Máximo 10MB por archivo.' }],
        old: req.body
      })
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.render('pages/createPost', {
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

    res.render('pages/createPost', {
      errors: [{ message: err.message || 'Error al crear la publicación' }],
      old: req.body
    })
  }
}

exports.showEditForm = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: PostImage, as: 'images' }]
    })

    if (!post || post.UserId !== req.user.id) {
      return res.redirect(`/profile/${req.user.username}`)
    }

    res.render('pages/editPost', {
      post,
      username: req.user.username,
      errors: [],
      old: {}
    })
  } catch (err) {
    return res.redirect(`/profile/${req.user.username}`)
  }
}

// ✏️ Actualizar publicación
exports.updatePost = async (req, res) => {
  try {
    await postService.updatePost(req)
    res.redirect(`/profile/${req.user.username}?success=Publicación+actualizada+correctamente`)
  } catch (err) {
    // ✅ Recuperar el post para re-renderizar el formulario
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: PostImage, as: 'images' }]
    }).catch(() => null)

    res.render('pages/editPost', {
      post: post || { id: req.params.id, title: req.body.title, description: req.body.description },
      errors: [{ message: 'Error al actualizar la publicación' }],
      old: req.body
    })
  }
}

// 🗑️ Eliminar publicación
exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req)
    return res.redirect(`/profile/${req.user.username}?success=Publicación+eliminada+correctamente`)
  } catch (err) {
    return res.redirect(`/profile/${req.user.username}?error=Error+al+eliminar`)
  }
}
