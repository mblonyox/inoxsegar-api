const express = require('express')
const { check, query } = require('express-validator/check')

const Movie = require('../models/movie')
const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr } = require('../helpers')

const router = express.Router()

router.use(verifyToken)

router.get('/movie',[
  query('search').isLength({max: 40}).optional(),
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 100}).optional(),
  query('sort').isIn(['date', 'size']).optional(),
  checkValidation
], (req, res) => {
  const search = req.query.search || ''
  const limit = req.query.limit || 20
  const page = req.query.page || 1

  Movie.find({
    title: {
      '$regex': search
    }
  })
  .skip((page - 1) * limit)
  .limit(limit)
  .sort('-date')
  .populate()
  .then(movies => {
    return res.json({
      success: true,
      message: 'Movies found!',
      data: { movies }
    })
  })
  .catch(catchErr(res))
})

router.get('/movie/:movieId', (req, res) => {
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
    .catch(catchErr(res))
})

function splitTrim(str) {
  return str.split(',').map(t => t.trim());
}

router.post('/movie', [
  check('title').exists().withMessage('Judul harus ada!'),
  check('year').exists().withMessage('Tahun film harus diisi.')
    .isInt().withMessage('Tahun harus diisi dengan angka'),
  check('poster').isURL().withMessage('URL Poster yang diisikan salah.'),
  checkValidation
], (req, res) => {
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
    uploader: req.user._id
  })

  newMovie.save()
  .then(movie => {
    return res.json({
      success: true,
      message: 'New movie added.',
      data: { movie }
    })
  })
  .catch(catchErr(res))
})

router.post('/movie/add-file', [
  check('movieId').exists().withMessage('Movie id kosong.')
    .isMongoId().withMessage('Id Movie tidak valid'),
  check('fileId').exists().withMessage('File id kosong')
    .isMongoId().withMessage('Id File tidak valid'),
  checkValidation
], (req, res) => {
  let movie, file
  Promise1 = Movie.findById(req.body.movieId)
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
    .catch(catchErr(res))
})

module.exports = router
