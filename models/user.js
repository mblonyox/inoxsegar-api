var mongoose = require('mongoose')
var Schema = mongoose.Schema

module.exports = mongoose.model('User', new Schema({
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  isMale: Boolean,
  isAdmin: Boolean
}))
