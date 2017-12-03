var express = require('express')
var jwt = require('jsonwebtoken')
var User = require('../models/user')
var configJWT = require('../config/jwt')

var router = express.Router();

router.post('/', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({
      success: false,
      message: 'Invalid request.'
    })
  }
  User.findOne({
    username: req.body.username
  }).then((user) => {
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed! User not found.'
      })
    } else {
      if (user.password !== req.body.password) {
        res.json({
          success: false,
          message: 'Authentication failed! Wrong password.'
        })
      } else {
        var payload = {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
        res.json({
          success: true,
          message: 'Authentication success! Welcome ' + user.firstName + '.',
          token: jwt.sign(payload, configJWT.secret)
        })
      }
    }
  })
})

module.exports = router
