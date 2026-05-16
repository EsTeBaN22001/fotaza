const authService = require('../services/authService')

exports.getLogin = (req, res) => {
  res.render('pages/login', {
    errors: [],
    old: {},
    returnTo: req.query.returnTo || ''
  })
}

exports.postlogin = async (req, res) => {
  try {
    const token = await authService.login(req.body.email, req.body.password)
    const returnTo = req.body.returnTo || '/home'

    res.cookie('token', token)
    res.redirect(returnTo)
  } catch (err) {
    res.render('pages/login', {
      errors: [{ message: err.message }],
      old: req.body,
      returnTo: req.body.returnTo || ''
    })
  }
}

exports.getRegister = (req, res) => {
  res.render('pages/register', {
    errors: [],
    old: {},
    returnTo: req.query.returnTo || ''
  })
}

exports.postRegister = async (req, res) => {
  try {
    await authService.register(req.body)

    return res.render('pages/login', {
      success: 'Usuario registrado correctamente',
      errors: [],
      old: {},
      returnTo: req.body.returnTo || ''
    })
  } catch (err) {
    return res.render('pages/register', {
      errors: [{ message: err.message }],
      old: req.body,
      returnTo: req.body.returnTo || ''
    })
  }
}

exports.logout = (req, res) => {
  res.clearCookie('token')

  return res.redirect('/auth/login')
}
