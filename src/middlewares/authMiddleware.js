const jwt = require('jsonwebtoken')
const { User } = require('../models')

exports.authRequired = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.redirect('/login')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id)

    if (!user || !user.active) {
      return res.redirect('/login')
    }

    req.user = user

    next()
  } catch (err) {
    return res.redirect('/login')
  }
}

exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    req.user = user || null

    next()
  } catch {
    req.user = null
    next()
  }
}

exports.requireRole = role => {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/login')

    if (req.user.role !== role) {
      return res.status(403).send('No autorizado')
    }

    next()
  }
}
