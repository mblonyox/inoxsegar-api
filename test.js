const axios = require('axios')
const mongoose = require('mongoose')
const configDB = require('./config/database')
const User = require('./models/user')
const Movie = require('./models/movie')

mongoose.Promise = global.Promise
mongoose.connect(configDB.uri)

Movie.find()
  .then(movies => {
    return processArray(movies, getMovie)
  })
  .then(() => {
    mongoose.disconnect()
  })

async function processArray(array, callback) {
  array.forEach(async item => {
    await callback(item)
  });
  console.log('Done!')
}

async function getMovie(movie) {
  const info = await axios.get('https://www.omdbapi.com/?apikey=ee9771cd&i='+movie.imdb)
  console.log('Process movie: ' + movie.title )
  movie.imdbRating = ( info.data.imdbVotes && info.data.imdbRating !== 'N/A' ? info.data.imdbRating : undefined )
  movie.imdbVotes = ( info.data.imdbVotes && info.data.imdbVotes !== 'N/A' ? info.data.imdbVotes.replace(/,/g, '') : undefined )
  movie.released = info.data.Released
  movie.runtime = info.data.Runtime
  return await movie.save()
}