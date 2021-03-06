const express = require('express')
const { check, query } = require('express-validator/check')

const Movie = require('../models/movie')
const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { sendNotif } = require('../helpers')

const router = express.Router()

router.use(verifyToken)

//#region Get Movies
router.get('/',[
  query('search').isLength({max: 40}).optional(),
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 100}).optional(),
  query('sort').isIn(['', '_id', '-_id', 'year', '-year', 'imdbRating', '-imdbRating', 'imdbVotes', '-imdbVotes']).optional(),
  checkValidation
], (req, res, next) => {
  const search = req.query.search || ''
  const limit = req.query.limit || 20
  const page = req.query.page || 1
  const sort = req.query.sort || '-_id'

  const regex = new RegExp(search, 'i')
  const stringRegex = {
    '$regex': regex
  }
  const inRegex = {
    '$in': [regex]
  }

  Movie.find({
    '$or': [
      { title: stringRegex },
      { genre: inRegex },
      { country: inRegex },
      { language: inRegex },
      { director: inRegex },
      { writer: inRegex },
      { cast: inRegex },
      { plot: stringRegex }
    ]
  })
  .skip((page - 1) * limit)
  .limit(limit)
  .sort(sort)
  .populate()
  .then(movies => {
    return res.json({
      success: true,
      message: 'Movies found!',
      data: { movies }
    })
  })
  .catch(next)
})
//#endregion

//#region Get Movie Details
router.get('/:movieId', (req, res, next) => {
  Movie.findById(req.params.movieId)
    .populate({
      path: 'files',
      populate: {
        path: 'uploader',
        select: 'username _id'
      }
    })
    .then(movie => {
      return res.json({
        success: true,
        message: 'Movie found!',
        data: { movie }
      })
    })
    .catch(next)
})
//#endregion

function splitTrim(str) {
  return str.split(',').map(t => t.trim());
}

//#region Post new Movie
router.post('/', [
  check('title').exists().withMessage('Judul harus ada!'),
  check('year').exists().withMessage('Tahun film harus diisi.')
    .isInt().withMessage('Tahun harus diisi dengan angka'),
  check('poster').isURL().withMessage('URL Poster yang diisikan salah.'),
  checkValidation
], (req, res, next) => {
  const newMovie = new Movie({
    imdb: req.body.imdb,
    title: req.body.title,
    year: req.body.year,
    genre: splitTrim(req.body.genre),
    country: splitTrim(req.body.country),
    language: splitTrim(req.body.language),
    director: splitTrim(req.body.director),
    writer: splitTrim(req.body.writer),
    cast: splitTrim(req.body.cast),
    plot: req.body.plot,
    poster: req.body.poster,
    released: req.body.released,
    runtime: req.body.runtime,
    imdbRating: req.body.rating,
    imdbVotes: req.body.votes,
    createdBy: req.user._id
  })

  newMovie.save()
  .then(movie => {
    const payload = JSON.stringify({
      title: 'InoxSegar - New Movie!',
      body: `${movie.title} (${movie.year}) - ${movie.plot}`,
      image: movie.poster,
      url: '/movie/' + movie._id
    })
    sendNotif('movie', payload)
    return res.json({
      success: true,
      message: 'New movie added.',
      data: { movie }
    })
  })
  .catch(next)
})
//#endregion

//#region Post Movie's File
router.post('/:movieId/file', [
  check('fileId').exists().withMessage('File id kosong')
    .isMongoId().withMessage('Id File tidak valid'),
  checkValidation
], (req, res, next) => {
  let movie, file
  Promise1 = Movie.findById(req.params.movieId)
    .then(m => {
      movie = m
    })
  Promise2 = File.findById(req.body.fileId)
    .populate({
      path: 'uploader',
      select: '_id username'
    })
    .then(f => {
      file = f
    })
  Promise.all([Promise1, Promise2])
    .then(() => {
      movie.files.push(file._id)
      file.koleksi = {
        data: movie._id,
        tipe: 'Movie'
      }
      return Promise.all([movie.save(), file.save()])
    })
    .then(() => {
      return res.json({
        success: true,
        message: 'File berhasil ditambahkan',
        data: {file}
      })
    })
    .catch(next)
})
//#endregion

module.exports = router
