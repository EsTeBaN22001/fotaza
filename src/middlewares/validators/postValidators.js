const { sanitizeField } = require('../sanitizeMiddleware')

exports.sanitizeCreatePost = [sanitizeField('title'), sanitizeField('description', true)]
