const mongooose = require('mongoose')
const Schema = mongooose.Schema

module.exports = mongooose.model('File', new Schema({
  id: String,
  name: String,
  size: Number,
  type: String,
  date: Date,
  uploader: String,
  uploaded_date: Date,
  uploaded_length: Number,
  uploaded_path: String
}))