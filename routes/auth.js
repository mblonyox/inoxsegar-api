var express = require('express')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var axios = require('axios')
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
        const payload = {
          id: user._id
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
        var emailData = {
          username: user.username,
          email: user.email,
          activation_code: user.activation_code
        }
        var urlEmail = 'https://mblonyox.com/inoxsegar-activation-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
        axios.get(urlEmail)
        var payload = {
          id: user._id
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
  User.findOne({email: req.user.email}).select('+activation_code')
  .then((user) => {
    if(user && user.activation_code === req.body.kode) {
      user.active = true
      user.activated_at = Date.now()
      user.save((err, user) => {
        if(err) {
          res.status(503).json({
            success: false,
            message: err.message
          })
        } else {
          res.json({
            success: true,
            message: 'User activated.'
          })
        }
      })
    } else {
      res.status(403).json({
        success: false,
        message: 'Wrong activation code.'
      })
    }
  })
  .catch((err) => {
    res.status(503).json({
      success: false,
      message: err.message
    })
  })
})

router.get('/resend_activation', verifyToken, (req, res) => {
  User.findOne({email: req.user.email}).select('+activation_code')
  .then((user) => {
    var emailData = {
      username: user.username,
      email: user.email,
      activation_code: user.activation_code
    }
    var urlEmail = 'https://mblonyox.com/inoxsegar-activation-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
    axios.get(urlEmail)
      .then((response) => {
        if (response.data == 'OK') {
          res.json({
            success: true,
            message: 'Activation email sent.'
          })
        } else {
          res.status(503).json({
            success: false,
            message: 'Email failed to sent. Please try again later.'
          })
        }
      })
      .catch((err) => {
        res.status(503).json({
          success: false,
          message: err.message
        })
      })
  })
  .catch((err) => {
    res.status(503).json({
      success: false,
      message: err.message
    })
  })
})

router.post('/check_username', [
  check('username')
  .isAlphanumeric().withMessage('Nama Pengguna hanya dapat huruf dan angka!')
  .isLength({ min: 5, max: 40}).withMessage('Nama Pengguna minimal 5 karakter dan maksimal 40 karakter!')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  User.findOne({
    username: req.body.username
  }).then((user) => {
    if (user) {
      res.json({
        success: false,
        message: 'Nama Pengguna telah terdaftar.'
      })
    } else {
      res.json({
        success: true,
        message: 'Nama Pengguna tersedia.'
      })
    }
  })
})

module.exports = router
