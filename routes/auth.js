var express = require('express')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var { check, validationResult } = require('express-validator/check')
var { matchedData } = require('express-validator/filter')

var User = require('../models/user')
var configJWT = require('../config/jwt')
var verifyToken = require('../middlewares/verify_token')

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
  })
  .select('+password')
  .then((user) => {
    bcrypt.compare(req.body.password, user ? user.password: '')
    .then((result) => {
      if (!user || !result) {
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
          user: {...user._doc, password: undefined},
          token: jwt.sign(payload, configJWT.secret)
        })
      }
    })
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
  let validData = matchedData(req)
  bcrypt.hash(validData.password, 10)
  .then((hash) => {
    validData.password = hash
    let newUser = new User({
      ...validData
    })
    newUser.save((err, user) => {
      if(err) res.json({
        success: false,
        message: err.message
      })
      else {
        var payload = {
          username: user.username,
          email: user.email
        }
        res.json({
          success: true,
          message: 'New user created',
          user,
          token: jwt.sign(payload, configJWT.secret)
        })
      }
    })
  })
})

router.post('/activate', verifyToken, (req, res) => {
  
})

router.post('/check_username', [
  check('username')
  .isAlphanumeric().withMessage('Nama Pengguna hanya dapat huruf dan angka!')
  .isLength({ min: 5, max: 40}).withMessage('Nama Pengguna minimal 5 karakter dan maksimal 40 karakter!')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  User.findOne({
    username: req.body.username
  }).then((user) => {
    if (user) {
      return res.json({
        success: false,
        message: 'Nama Pengguna telah terdaftar.'
      })
    } else {
      return res.json({
        success: true,
        message: 'Nama Pengguna tersedia.'
      })
    }
  })
})

module.exports = router
