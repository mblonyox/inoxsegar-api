const express = require('express')

const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')

const router = express.Router();

router.use(verifyToken);

router.get('/file', (req, res) => {
  File.find({}, null, {limit: 10}).populate('uploader')
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
