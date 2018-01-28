const mongoose = require('mongoose')
const configDB = require('./config/database')
const User = require('./models/user')

mongoose.Promise = global.Promise
mongoose.connect(configDB.uri, {useMongoClient: true})

User.findById('5a39435be7c92b164cb8f950')
  .then((user) => {
    if (user) console.log(user._id)
  })
