const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

module.exports = mongoose.model('Chat', new Schema({
  sender: {type: ObjectId, ref: 'User'},
  text: String
}, {
  timestamps: true
}))