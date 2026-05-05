const authService = require('../services/authService')

exports.showLogin = (req, res) => {
  res.render('pages/login')
}

exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body.email, req.body.password)

    res.cookie('token', token)
    res.redirect('/')
  } catch (err) {
    res.send(err.message)
  }
}
