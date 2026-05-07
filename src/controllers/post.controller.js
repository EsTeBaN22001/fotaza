const { Post, PostImage, User, Tag } = require('../models')
const postService = require('../services/postService')

exports.showCreate = (req, res) => {
  res.render('pages/createPost', {
    old: {}
  })
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
