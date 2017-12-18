var mongoose = require('mongoose')
var Schema = mongoose.Schema

function randomCode () {
  let code = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' 
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

module.exports = mongoose.model('User', new Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true, select: false},
  active: {type: Boolean, default: false},
  activation_code: {type: String, select: false, default: randomCode()},
  admin:  {type: Boolean, default: false},
  activated_at: {type: Date, default: null}
}, {
  timestamps: true
}))
