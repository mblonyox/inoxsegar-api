const mongooose = require('mongoose')
const Schema = mongooose.Schema

module.exports = mongooose.model('File', new Schema({
  id: String,
  name: String,
  size: Number,
  type: String,
  date: Date,
  uploader: String,
  koleksi: {
    id: String,
    type: String,
    title: String,
    season: Number,
    episode: Number
  },
  comments: [{
    username: String,
    body: String,
    date: Date
  }],
  metadata: {
    likes: [String],
    dislike:[String],
    downloads: [String]
  },
  uploaded_date: Date,
  uploaded_length: Number,
  uploaded_path: String
}))