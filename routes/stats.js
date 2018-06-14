const express = require('express')
const { query } = require('express-validator/check')

const Log = require('../models/log')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')

const router = express.Router()
router.use(verifyToken)

router.get('/log_download', [
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 500}).optional(),
  checkValidation
], (req, res, next) => {
  const limit = req.query.limit || 100
  const page = req.query.page || 1
  Log.find({action: 'Download'})
  .skip((page - 1) * limit)
  .limit(limit)
  .sort('-_id')
  .populate('user')
  .populate('target')
  .then(logs => {
    return res.json({
      success: true,
      message: 'Logs found.',
      data: {logs}
    })
  })
  .catch(next)
})

module.exports = router
