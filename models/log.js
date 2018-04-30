const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('Log', new Schema({
  action: String,
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  target: {type: Schema.Types.ObjectId, refPath: 'tipe'},
  tipe: String,
  message: String
}, {
  timestamps: true
}))
