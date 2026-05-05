const { sanitizeField } = require('../sanitizeMiddleware')

exports.sanitizeRegisterUser = [
  sanitizeField('username'),
  sanitizeField('email').isEmail().withMessage('Email inválido'),
  sanitizeField('password').isLength({ min: 6 }).withMessage('Min 6 caracteres')
]

exports.sanitizeLoginUser = [sanitizeField('email').isEmail().withMessage('Email inválido'), sanitizeField('password')]
