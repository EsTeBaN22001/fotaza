const { body } = require('express-validator')
const sanitizeHtml = require('sanitize-html')

const sanitizeField = (field, optional = false) => {
  let validator = body(field)
    .trim()
    .customSanitizer(value => (typeof value === 'string' ? sanitizeHtml(value) : value))

  if (optional) {
    validator = validator.optional({ nullable: true, checkFalsy: true })
  } else {
    validator = validator.notEmpty().withMessage(`${field} es requerido`)
  }

  return validator
}

module.exports = { sanitizeField }
