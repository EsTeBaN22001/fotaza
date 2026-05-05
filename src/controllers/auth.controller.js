const authService = require('../services/authService')

exports.getLogin = (req, res) => {
  res.render('pages/login', {
    errors: [],
    old: {}
  })
}

exports.postlogin = async (req, res) => {
  try {
    const token = await authService.login(req.body.email, req.body.password)

    res.cookie('token', token)
    res.redirect('/home')
  } catch (err) {
    res.render('pages/login', {
      errors: [{ message: err.message }],
      old: req.body
    })
  }
}

exports.getRegister = (req, res) => {
  res.render('pages/register', {
    errors: [],
    old: {}
  })
}

exports.postRegister = async (req, res) => {
  try {
    await authService.register(req.body)

    return res.render('pages/login', {
      success: 'Usuario registrado correctamente',
      errors: [],
      old: {}
    })
  } catch (err) {
    return res.render('pages/register', {
      errors: [{ message: err.message }],
      old: req.body
    })
  }
}

exports.logout = (req, res) => {
  res.clearCookie('token')

  return res.redirect('/auth/login')
}
