const express = require('express')

const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')

const router = express.Router();

router.get('/files', verifyToken, (req, res) => {
  File.find({}, null, {limit: 10})
  .then(files => {
    res.json({
      success: true,
      message: 'Files found.',
      data: { files }
    })
  })
})

module.exports = router
