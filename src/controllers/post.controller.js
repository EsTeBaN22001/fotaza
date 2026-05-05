const postService = require('../services/postService')

exports.showCreate = (req, res) => {
  res.render('pages/createPost', {
    errors: [],
    old: {}
  })
}

exports.createPost = async (req, res) => {
  try {
    // ✅ El service se encarga de validar y procesar todo
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
      return res.redirect('/auth/login') // o renderizar con error
    }

    // ✅ Errores generales
    console.error('❌ Error en createPost controller:', err.message)
    res.render('pages/createPost', {
      errors: [{ message: err.message || 'Error al crear la publicación' }],
      old: req.body
    })
  }
}
