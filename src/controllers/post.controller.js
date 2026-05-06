const { Post, PostImage } = require('../models')
const postService = require('../services/postService')

exports.showCreate = (req, res) => {
  res.render('pages/createPost', {
    errors: [],
    old: {}
  })
}

exports.createPost = async (req, res) => {
  try {
    await postService.createPost(req)
    res.redirect('/home')
  } catch (err) {
    // ✅ Errores de Multer
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

    // ✅ Errores de validación del service
    if (err.message === 'Usuario no autenticado') {
      return res.redirect('/auth/login')
    }

    // ✅ Errores generales → misma vista con errors
    console.error('❌ Error en createPost controller:', err.message)
    res.render('pages/createPost', {
      errors: [{ message: err.message || 'Error al crear la publicación' }],
      old: req.body
    })
  }
}

// ✏️ Mostrar formulario de edición
exports.showEditForm = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: PostImage, as: 'images' }]
    })

    // ✅ Si no existe o no es el dueño → redirigir con error por query param
    if (!post || post.UserId !== req.user.id) {
      return res.redirect('/profile/my-posts?error=No+tienes+permiso+para+editar+esta+publicación')
    }

    // ✅ Renderizar con errors vacío (el layout lo mostrará si hay algo)
    res.render('pages/editPost', {
      post,
      errors: [],
      old: {}
    })
  } catch (err) {
    console.error('❌ Error cargando edición:', err.message)
    res.redirect('/profile/my-posts?error=Error+al+cargar+el+formulario')
  }
}

// ✏️ Actualizar publicación
exports.updatePost = async (req, res) => {
  try {
    await postService.updatePost(req)
    res.redirect('/profile/my-posts?success=Publicación+actualizada+correctamente')
  } catch (err) {
    // ✅ Recuperar el post para re-renderizar el formulario
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: PostImage, as: 'images' }]
    }).catch(() => null)

    res.render('pages/editPost', {
      post: post || { id: req.params.id, title: req.body.title, description: req.body.description },
      errors: [{ message: err.message || 'Error al actualizar la publicación' }],
      old: req.body
    })
  }
}

// 🗑️ Eliminar publicación
exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req)
    res.redirect('/profile/my-posts?success=Publicación+eliminada+correctamente')
  } catch (err) {
    console.error('❌ Error eliminando post:', err.message)
    res.redirect('/profile/my-posts?error=' + encodeURIComponent(err.message || 'Error al eliminar'))
  }
}
