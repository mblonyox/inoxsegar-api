const express = require('express')

const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')

const router = express.Router();

router.use(verifyToken);

router.get('/file', (req, res) => {
  File.find({}, null, {limit: 20, sort: '-date'})
  .populate({
    path: 'uploader',
    select: '_id username'
  })
  .populate({
    path: 'koleksi.data',
    select: '_id title year'
  })
  .then(files => {
    res.json({
      success: true,
      message: 'Files found.',
      data: { files }
    })
  })
  .catch(err => {
    res.json({
      success: false,
      message: 'Database error.',
      error: err
    })
  })
})

module.exports = router
