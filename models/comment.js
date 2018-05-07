const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

module.exports = mongoose.model('Comment', new Schema({
  author: {type: ObjectId, ref: 'User'},
  message: String,
  likes: [{
    time: String,
    user: {type: ObjectId, ref: 'User'}
  }],
  dislikes: [{
    time: String,
    user: {type: ObjectId, ref: 'User'}
  }],
  seen: [{
    time: String,
    user: {type: ObjectId, ref: 'User'}
  }],
  approved: {
    time: String,
    by: {type: ObjectId, ref: 'User'}
  }
}, {
  timestamps: true
}))