const express = require('express')
const { query, body } = require('express-validator/check')

const File = require('../models/file')
const Log = require('../models/log')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')

const router = express.Router();

router.use(verifyToken);

//#region Get Files
router.get('/', [
  query('search').isLength({max: 40}).optional(),
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 100}).optional(),
  query('sort').isIn(['date', 'size']).optional(),
  query('nonkoleksi').isBoolean().optional(),
  checkValidation
], (req, res, next) => {
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
    select: '_id title year poster'
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
  .catch(next)
})
//#endregion

//#region Post Like File
router.post('/:fileId/like', [
  body('action').isIn(['like', 'dislike']),
  body('cancel').isBoolean().optional(),
  checkValidation
], (req, res, next) => {
  File.findById(req.params.fileId)
  .populate({
    path: 'uploader',
    select: '_id username'
  })
  .populate({
    path: 'koleksi.data',
    select: '_id title year poster'
  })
  .then(file => {
    if(req.body.action === 'like') {
      if(req.body.cancel) {
        file.metadata.likes.splice(file.metadata.likes.indexOf(req.user._id), 1)
      }
      else file.metadata.likes.push(req.user._id)
    }
    if(req.body.action === 'dislike') {
      if(req.body.cancel) {
        file.metadata.dislike.splice(file.metadata.dislike.indexOf(req.user._id), 1)
      }
      else file.metadata.dislike.push(req.user._id)
    }
    return file.save()
  })
  .then(file => {
    return res.json({
      success: true,
      message: req.body.action + ' berhasil disimpan.',
      data: {file}
    })
  })
  .catch(next)
})
//#endregion

//#region Get Download File
router.get('/:fileId/download', (req, res, next) => {
  File.findById(req.params.fileId)
  .select('+id')
  .then(file => {
    new Log({
      action: 'Download',
      user: req.user._id,
      target: file._id,
      tipe: 'File'
    }).save()
    if (file.metadata.downloads.indexOf(req.user._id) === -1) {
      file.metadata.downloads.push(req.user._id)
      return file.save()
    }
    return file
  })
  .then(file => {
    return res.redirect(`${req.protocol}://${req.hostname}/${file.uploaded_path}/${file.id}/${file.name}`)
  })
  .catch(next)
})
//#endregion

module.exports = router
