const fs = require('fs')
const path = require('path')
const modules = []

const files = fs.readdirSync(__dirname)
for (const file of files) {
  if (file === 'index.js') continue
  modules.push(require(path.join(__dirname, file)))
}

module.exports = modules