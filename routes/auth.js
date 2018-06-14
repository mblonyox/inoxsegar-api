const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const axios = require('axios')
const { check } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const User = require('../models/user')
const configJWT = require('../config/jwt')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr } = require('../helpers')

const router = express.Router();

//#region Authenticate
router.post('/authenticate', [
  check('email').isEmail().withMessage('Email harus diisi!'),
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!'),
  check('remember').optional(),
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
          message: 'Email dan/atau sandi salah.'
        })
      } else {
        const payload = {
          id: user._id,
          remember: !!req.body.remember
        }
        res.json({
          success: true,
          message: 'Autentikasi berhasil! Selamat datang ' + user.username + '.',
          user: {...user._doc, password: undefined, activation_code: undefined},
          token: jwt.sign(payload, configJWT.secret, {expiresIn: '10 minutes'})
        })
      }
    })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Register
router.post('/register', [
  check('username')
    .isAlphanumeric().withMessage('Nama Pengguna hanya dapat huruf dan angka!')
    .isLength({ min: 5, max: 40}).withMessage('Nama Pengguna minimal 5 karakter dan maksimal 40 karakter!'),
  check('email').isEmail().withMessage('Email tidak valid!'),
  check('password').isLength({ min: 8 }).withMessage('Sandi minimal 8 karakter!'),
  checkValidation
], (req, res) => {
  const validData = matchedData(req)
  User.find({$or: [
    {username: validData.username},
    {email: validData.email}
  ]}).then((users) => {
    if(users.length > 0) return Promise.reject(new Error('Username atau Email sudah terdaftar.'))
    return
  }).then(() => {
    return bcrypt.hash(validData.password, 10)
  })
  .then((hash) => {
    validData.password = hash
    const newUser = new User({
      ...validData
    })
    return newUser.save()
  })
  .then((user) => {
    const jwtToken = jwt.sign({id: user._id, remember: false}, configJWT.secret, {expiresIn: '10 minutes'})
    const userData =  {...user._doc, password: undefined, activation_code: undefined}
    const emailData = {
      username: user.username,
      email: user.email,
      activation_code: user.activation_code
    }
    const urlEmail = 'https://mblonyox.com/inoxsegar-activation-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
    axios.get(urlEmail)
      .then((response) => {
        if (response.data == 'OK') {
          res.json({
            success: true,
            message: 'Pendaftaran berhasil dan email aktivasi terkirim.',
            user: userData,
            token: jwtToken
          })
        } else return Promise.reject(new Error('Pendaftaran berhasil tetapi email aktivasi gagal terkirim.'))
      })
      .catch((err) => {
        res.json({
          success: true,
          message: err.message,
          user: userData,
          token: jwtToken
        })
      })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Activate
router.post('/activate', verifyToken, [
  check('kode').withMessage('Kode aktivasi kosong.'),
  checkValidation
], (req, res) => {
  User.findOne({email: req.user.email}).select('+activation_code')
  .then((user) => {
    if(user && user.activation_code === req.body.kode) {
      user.active = true
      user.activated_at = Date.now()
      return user.save()
        .then((user) => {
          return res.json({
            success: true,
            message: 'Pengguna telah diaktifkan.'
          })
        })
    }
    return res.status(403).json({
      success: false,
      message: 'Kode aktivasi salah.'
    })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Resend Activation
router.get('/resend_activation', verifyToken, (req, res) => {
  User.findOne({email: req.user.email}).select('+activation_code')
  .then((user) => {
    const emailData = {
      username: user.username,
      email: user.email,
      activation_code: user.activation_code
    }
    const urlEmail = 'https://mblonyox.com/inoxsegar-activation-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
    return axios.get(urlEmail)
      .then((response) => {
        if (response.data == 'OK') {
          return res.json({
            success: true,
            message: 'Email aktivasi terkirim.'
          })
        }
        return Promise.reject(new Error( 'Email gagal dikirim. Coba lagi beberapa saat.'))
      })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Reset Password
router.post('/reset_password', [
  check('email')
  .isEmail().withMessage('Email harus valid.')
  ,checkValidation
], (req, res) => {
  User.findOne({
    email: req.body.email
  }).then((user) => {
    if(user) {
      const emailData = {
        username: user.username,
        email : user.email,
        token: jwt.sign({email: user.email}, configJWT.secret)
      }
      const urlEmail = 'https://mblonyox.com/inoxsegar-resetpassword-sv2.php?data='+ new Buffer(JSON.stringify(emailData)).toString("base64")
      return axios.get(urlEmail)
    } else return Promise.reject(new Error('Tidak ada pengguna email tersebut.'))
  })
  .then((response) => {
    if (response.data == 'OK') {
      res.json({
        success: true,
        message: 'Email reset sandi terkirim.'
      })
    } else return Promise.reject(new Error('Email gagal dikirim. Coba lagi beberapa saat.'))
  })
  .catch(catchErr(res))
})
//#endregion

//#region Change Password
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
          message: 'Sandi berhasil diganti.'
        })
      })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Refresh Token
router.post('/refresh_token', [
  check('token').withMessage('Token tidak tersedia'),
  checkValidation
], (req, res) => {
  let payload
  try {
    payload = jwt.verify(req.body.token, configJWT.secret, {ignoreExpiration: true})
  } catch (err) {
    return res.status(422).json({
      success: false,
      message: err.message
    })
  }
  const now = Math.floor(Date.now() / 1000)
  const extra = payload.remember ? (7*24*60*60) : (60*60)

  if (payload.exp + extra > now ) {
    return res.json({
      success: true,
      message: 'Token diperbarui.',
      token: jwt.sign({id: payload.id, remember: payload.remember}, configJWT.secret, {expiresIn: '10 minutes'})
    })
  }

  return res.status(403).json({
    success: false,
    message: 'Token gagal dipebarui'
  })

})
//#endregion

module.exports = router
