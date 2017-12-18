const jwt = require('jsonwebtoken')
const configJWT = require('../config/jwt')

module.exports = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization
  token = token.replace('Bearer ', '')
  jwt.verify(token, configJWT.secret, (err, decoded) => {
    if (err) {
      res.status(401).json({
        success: false,
        message: err.message
      })
    } else {
      req.user = decoded
      next()
    }
  })
}
