const express = require('express')
const tus = require('tus-node-server')
const mongoose = require('mongoose');

const File = require('../models/file')
const User = require('../models/user')
const verifyToken = require('../middlewares/verify_token')

const path = 'files'
const router = express.Router()
const server = new tus.Server()
server.datastore = new tus.FileStore({path})

server.on(tus.EVENTS.EVENT_UPLOAD_COMPLETE, (event) => {
  let metadata = {}
  let meta_string = event.file.upload_metadata
  let meta_array = meta_string.split(',')
  meta_array.forEach((element) => {
    let pair = element.split(' ')
    metadata[pair[0]] = Buffer.from(pair[1], 'base64').toString()
  })

  const newFile = new File({
    id: event.file.id,
    name: metadata.filename,
    size: metadata.size,
    type: metadata.type,
    uploader: mongoose.Types.ObjectId(metadata.uploader),
    date: Date(metadata.modified),
    uploaded_date: Date.now(),
    uploaded_length: event.file.uploaded_length,
    uploaded_path: path
  })
  newFile.save()
  .then((file) => {
    console.log(file.name + ' created!')
  })

})

router.all('*',verifyToken, server.handle.bind(server))

module.exports = router