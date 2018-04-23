const express = require('express')
const { query } = require('express-validator/check')

const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr } = require('../helpers')

const router = express.Router();

router.use(verifyToken);

router.get('/file', [
  query('search').isLength({max: 40}).optional(),
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 100}).optional(),
  query('sort').isIn(['date', 'size']).optional(),
  query('nonkoleksi').isBoolean().optional(),
  checkValidation
], (req, res) => {
  const search = req.query.search || ''
  const limit = req.query.limit || 20
  const page = req.query.page || 1
  let fileQuery = File.find({
    name: {
      '$regex': search
    },
  })
  .skip((page - 1) * limit)
  .limit(limit)
  .sort('-date')
  .populate({
    path: 'uploader',
    select: '_id username'
  })
  .populate({
    path: 'koleksi.data',
    select: '_id title year'
  })
  if (req.query.nonkoleksi) {
    fileQuery = fileQuery.where({
      koleksi: null
    })
  }

  return fileQuery.then(files => {
    return res.json({
      success: true,
      message: 'Files found.',
      data: { files }
    })
  })
  .catch(catchErr(res))
})

router.get('/download/:fileId', (req, res) => {
  File.findById(req.params.fileId)
  .select('+id')
  .then(file => {
    if (file.metadata.downloads.indexOf(req.user._id) === -1) {
      file.metadata.downloads.push(req.user._id)
      return file.save()
    }
    return file
  })
  .then(file => {
    return res.redirect(`/${file.uploaded_path}/${file.id}/${file.name}`)
  })
  .catch(catchErr(res))
})

module.exports = router
