const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

module.exports = mongoose.model('Topic', new Schema({
  author: {type: ObjectId, ref: 'User'},
  title: String,
  message: String,
  categories: {type: ObjectId, ref: 'Category'},
  tags: [String],
  pinned: Boolean,
  closed: {
    time: String,
    by: {type: ObjectId, ref: 'User'},
    reason: String
  },
  comments: [
    {type: ObjectId, ref: 'Comment'},
  ]
}, {
  timestamps: true
}))