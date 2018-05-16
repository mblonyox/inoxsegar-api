const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('Movie', new Schema({
  imdb: {type: String, required: false, unique: true}, 
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
  released: String,
  runtime: String,
  imdbRating: Number,
  imdbVotes: Number,
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  favorited: [{type: Schema.Types.ObjectId, ref: 'User'}],
  files: [{type: Schema.Types.ObjectId, ref: 'File'}]
}, {
  timestamps: true
}))