const { validationResult } = require('express-validator/check')

module.exports = function checkValidation(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  return next();
}