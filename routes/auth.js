var express = require('express')
var jwt = require('jsonwebtoken')
var { check, validationResult } = require('express-validator/check')
var { matchedData } = require('express-validator/filter')
var User = require('../models/user')
var configJWT = require('../config/jwt')

var router = express.Router();

router.post('/authenticate', [
  check('email').isEmail().withMessage('Email harus diisi!'),
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  User.findOne({
    email: req.body.email
  }).then((user) => {
    if (!user || user.password !== req.body.password) {
      res.status(401).json({
        success: false,
        message: 'Wrong email or password.'
      })
    } else {
      var payload = {
        username: user.username,
        email: user.email
      }
      res.json({
        success: true,
        message: 'Authentication success! Welcome ' + user.username + '.',
        token: jwt.sign(payload, configJWT.secret)
      })
    }
  })
})

router.post('/register', [
  check('username')
    .isAlphanumeric().withMessage('Nama Pengguna hanya dapat huruf dan angka!')
    .isLength({ min: 5, max: 40}).withMessage('Nama Pengguna minimal 5 karakter dan maksimal 40 karakter!'),
  check('email').isEmail().withMessage('Email tidak valid!'),
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  validData = matchedData(req)
  newUser = new User({
    ...validData
  })
  newUser.save(err => {
    if(err) res.json({
      success: false,
      message: err.message
    })
    else res.json({
      success: true,
      message: 'New user created'
    })
  })
})

module.exports = router
