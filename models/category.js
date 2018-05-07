const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

module.exports = mongoose.model('Category', new Schema({
  name: String,
  slug: String,
  color: String,
  by: {type: ObjectId, ref: 'User'}
}))