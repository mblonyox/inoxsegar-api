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
  imdb: {type: String, required: false, unique: true},
  tvdb: {type: String, required: false, unique: true},
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
  imdbRating: Number,
  imdbVotes: Number,
  status: String,
  network: String,
  seasons: [Season],
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  favorited: [{type: Schema.Types.ObjectId, ref: 'User'}],
}, {
  timestamps: true
}))