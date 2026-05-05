exports.getHome = (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login')
  }
  res.render('pages/home', {
    errors: [],
    old: {}
  })
}
