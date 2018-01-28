const jwt = require('jsonwebtoken')
const configJWT = require('../config/jwt')
const User = require('../models/user')

module.exports = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization
  if (token) token = token.replace('Bearer ', '')
  jwt.verify(token, configJWT.secret, (err, decoded) => {
    if (err) {
      res.status(401).json({
        success: false,
        message: err.message
      })
    } else {
      User.findById(decoded.id)
        .then((user) => {
          if(user) req.user = user
          next()
        })
    }
  })
}
