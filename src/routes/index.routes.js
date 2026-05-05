const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login')
  }

  return res.redirect('/home')
})

module.exports = router
