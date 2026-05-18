
const jwt = require('jsonwebtoken')
const { User, Notification } = require('../models')

exports.attachUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      req.user = null
      res.locals.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'active', 'role', 'created_at']
    })

    if (!user || !user.active) {
      req.user = null
      res.locals.user = null
      if (req.cookies?.token) {
        res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' })
      }
      return next()
    }

    req.user = user
    res.locals.user = user

    try {
      const unreadNotifications = await Notification.count({
        where: { UserId: user.id, is_read: false }
      })
      res.locals.unreadNotifications = unreadNotifications
    } catch (e) {
      console.error('Error loading unread notifications count:', e)
      res.locals.unreadNotifications = 0
    }

    if (req.query.success) res.locals.success = req.query.success
    if (req.query.error) res.locals.error = req.query.error
    if (req.query.errors) {
      const errs = Array.isArray(req.query.errors) ? req.query.errors : [req.query.errors]
      res.locals.errors = errs.map(e => ({ message: e }))
    }
    next()
  } catch (err) {
    console.error('⚠️ attachUser error:', err.name, err.message)
    req.user = null
    res.locals.user = null
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' })
    }
    next()
  }
}

exports.authRequired = (req, res, next) => {
  if (!req.user) {

    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const error = new Error('Acceso restringido')
    error.status = 401
    return next(error)
  }
  next()
}

exports.validatorRequired = (req, res, next) => {
  if (!req.user || req.user.role !== 'validator') {
    return res.status(403).render('pages/error', {
      message: 'Acceso restringido: se requieren permisos de validador',
      errors: [],
      status: 403
    })
  }
  next()
}
