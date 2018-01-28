const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('File', new Schema({
  id: String,
  name: String,
  size: Number,
  type: String,
  date: Date,
  uploader: {type: Schema.Types.ObjectId, ref: 'User'},
  koleksi: {
    data: Schema.Types.ObjectId,
    type: String,
    season: Number,
    episode: Number
  },
  comments: [{
    username: {type: Schema.Types.ObjectId, ref: 'User'},
    body: String,
    date: Date
  }],
  metadata: {
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    dislike:[{type: Schema.Types.ObjectId, ref: 'User'}],
    downloads: [{type: Schema.Types.ObjectId, ref: 'User'}]
  },
  uploaded_date: Date,
  uploaded_length: Number,
  uploaded_path: String
}))