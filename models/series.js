const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('Series', new Schema({
  imdb: {type: String, required: false, unique: true},
  tvdb: {type: String, required: false, unique: true},
  title: String,
  year: Number,
  genre: [String],
  country: [String],
  language: [String],
  director: [String],
  writer: [String],
  cast: [String],
  plot: String,
  poster: String,
  status: String,
  firstAired: String,
  network: String,
  seasons: [{
    name: String,
    number: Number,
    description: String,
    startedAiring: String,
    finishedAiring: String,
    images: [String],
    episodes: [{
      name: String,
      number: Number,
      aired: String,
      files: [{type: Schema.Types.ObjectId, ref: 'File'}]
    }]
  }],
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  favorited: [{type: Schema.Types.ObjectId, ref: 'User'}],
}, {
  timestamps: true
}))