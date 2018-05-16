const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Episode = new Schema({
  name: String,
  number: Number,
  aired: String,
  overview: String,
  files: [{type: Schema.Types.ObjectId, ref: 'File'}]
})

const Season = new Schema({
  name: String,
  number: Number,
  images: [String],
  episodes: [Episode]
})

module.exports = mongoose.model('Series', new Schema({
  imdb: {type: String, index: true, unique: true, sparse: true},
  tvdb: {type: String, index: true, unique: true, sparse: true},
  mal: {type: String, index: true, unique: true, sparse: true},
  category: String,
  title: String,
  year: String,
  genre: [String],
  country: [String],
  language: [String],
  director: [String],
  writer: [String],
  cast: [String],
  plot: String,
  poster: String,
  released: String,
  runtime: String,
  imdbRating: Number,
  imdbVotes: Number,
  status: String,
  seasons: [Season],
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  favorited: [{type: Schema.Types.ObjectId, ref: 'User'}],
}, {
  timestamps: true
}))