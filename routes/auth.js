var express = require('express')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var axios = require('axios')
var { check } = require('express-validator/check')
var { matchedData } = require('express-validator/filter')

var User = require('../models/user')
var configJWT = require('../config/jwt')
var verifyToken = require('../middlewares/verify_token')
var checkValidation = require('../middlewares/check_validation')

var router = express.Router();


router.post('/authenticate', [
  check('email').isEmail().withMessage('Email harus diisi!'),
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!'),
  checkValidation
], (req, res) => {
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
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!'),
  checkValidation
], (req, res) => {
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
  .isLength({ min: 5, max: 40}).withMessage('Nama Pengguna minimal 5 karakter dan maksimal 40 karakter!'),
  checkValidation
], (req, res) => {
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

router.post('/reset_password', [
  check('email')
  .isEmail().withMessage('Email harus valid.')
  ,checkValidation
], (req, res) => {
  User.findOne({
    email: req.body.email
  }).then((user) => {
    if(user) {
      var emailData = {
        username: user.username,
        email : user.email,
        token: jwt.sign({email: user.email}, configJWT.secret)
      }
      var urlEmail = 'https://mblonyox.com/inoxsegar-resetpassword-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
      return axios.get(urlEmail)
    } else return Promise.reject(new Error('No user found'))
  })
  .then((response) => {
    if (response.data == 'OK') {
      res.json({
        success: true,
        message: 'Password reset email sent.'
      })
    } else return Promise.reject(new Error('Email failed to sent. Please try again later.')) 
  })
  .catch((err) => {
    return res.status(503).json({
      success: false,
      message: err.message
    })
  }) 
})

router.post('/change_password', [
  check('token').withMessage('Token tidak tersedia'),
  check('password').isLength({min: 8}).withMessage('Sandi minimal 8 karakter!'),
  checkValidation
], (req, res) => {
  let payload
  try {
    payload = jwt.verify(req.body.token, configJWT.secret)
  } catch (err) {
    return res.status(422).json({
      success: false,
      message: err.message
    })
  }
  User.findOne({email: payload.email})
  .then((user) => {
    return bcrypt.hash(req.body.password, 10)
      .then((hash) => {
        user.password = hash
        return user.save()
      })
      .then((user) => {
        return res.json({
          success: true,
          message: 'Password berhasil diganti.'
        })
      })
  })
  .catch((err) => {
    return res.status(503).json({
      success: false,
      message: err.message
    })
  })

})

module.exports = router
