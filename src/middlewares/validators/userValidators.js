const { sanitizeField } = require('../sanitizeMiddleware')

exports.sanitizeUsername = [sanitizeField('username').trim().escape().isAlphanumeric()]
