const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

const files = fs.readdirSync(__dirname)
for (const file of files) {
  if (file === 'index.js') continue
  const name = path.basename(file, '.js')
  router.use(`/${name}`, require(path.join(__dirname, file)))
}

module.exports = router