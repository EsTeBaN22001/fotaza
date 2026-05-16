// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')
const { User } = require('../models')

/**
 * Middleware combinado:
 * 1. Lee y verifica el token JWT de las cookies
 * 2. Adjunta el usuario a req.user
 * 3. Expone el usuario a vistas Pug vía res.locals.user
 */
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
/**
 * Middleware para proteger rutas: requiere usuario autenticado
 * Usar en rutas que solo usuarios logueados pueden acceder
 */
exports.authRequired = (req, res, next) => {
  if (!req.user) {
    // Si es una petición AJAX, devolvemos 401
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    // Pasamos el error al manejador global
    const error = new Error('Acceso restringido')
    error.status = 401
    return next(error)
  }
  next()
}

/**
 * Middleware para rutas de validador: requiere rol 'validator'
 */
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
