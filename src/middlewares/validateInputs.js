const { validationResult } = require('express-validator')

exports.validateInputs = view => {
  return (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const errorsData = errors.array().map(error => ({
        message: error.msg,
        field: error.path
      }))

      return res.status(400).render(view, {
        errors: errorsData,
        old: req.body,
        user: req.user || null
      })
    }

    next()
  }
}
