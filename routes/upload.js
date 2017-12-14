const express = require('express')
const tus = require('tus-node-server')

const router = express.Router()
const server = new tus.Server()
server.datastore = new tus.FileStore({
  path: 'files'
})

router.all('*', server.handle.bind(server))

module.exports = router