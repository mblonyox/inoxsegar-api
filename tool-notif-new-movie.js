const mongoose = require('mongoose')
const configDB = require('./config/database')
const { sendNotif } = require('./helpers')
const Movie = require('./models/movie')

mongoose.Promise = global.Promise
mongoose.connect(configDB.uri)

const id = process.argv[2]

Movie.findById(id)
  .then(movie => {
    const payload = JSON.stringify({
      title: 'InoxSegar - New Movie!',
      body: `${movie.title} (${movie.year}) - ${movie.plot}`,
      image: movie.poster,
      url: '/movie/' + movie._id
    })
    return sendNotif('movie', payload)
  })
  .then(results => {
    console.log(results.length + ' push terkirim.')
    mongoose.disconnect()
  })
  .catch(err => {
    console.error(err)
    mongoose.disconnect()
  })
