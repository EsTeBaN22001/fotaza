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

    // Si no hay token, usuario = null
    if (!token) {
      req.user = null
      res.locals.user = null
      return next()
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Buscar usuario en BD (sin avatar si no existe la columna)
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'active', 'role', 'created_at']
    })

    // Si el usuario no existe o está inactivo
    if (!user || !user.active) {
      req.user = null
      res.locals.user = null
      // Opcional: limpiar cookie inválida
      if (req.cookies?.token) {
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
      return next()
    }

    // ✅ Usuario válido: adjuntar a req y res.locals
    req.user = user
    res.locals.user = user

    next()
  } catch (err) {
    // Token inválido, expirado o error de BD
    console.error('⚠️ attachUser error:', err.name, err.message)

    req.user = null
    res.locals.user = null

    // Limpiar cookie si el token es inválido
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    next() // Nunca interrumpir el flujo por un error de autenticación
  }
}

/**
 * Middleware para proteger rutas: requiere usuario autenticado
 * Usar en rutas que solo usuarios logueados pueden acceder
 */
exports.authRequired = (req, res, next) => {
  if (!req.user) {
    // Guardar la ruta original para redirigir después del login
    return res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`)
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
