const express = require('express')
const { check, validationResult } = require('express-validator/check')

const Movie = require('../models/movie')
const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')

const router = express.Router()

router.use(verifyToken)

router.get('/movie', (req, res) => {
  Movie.find({}, null, {limit: 20, sort: '-_id'}).populate()
  .then(movies => {
    res.json({
      success: true,
      message: 'Movies found!',
      data: { movies }
    })
  })
  .catch(err => {
    res.json({
      success: false,
      message: 'Database error.',
      error: err
    })
  })
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
      res.json({
        success: true,
        message: 'Movie found!',
        data: { movie }
      })
    })
    .catch(err => {
      res.json({
        success: false,
        message: 'Database error.',
        error: err
      })
    })
})

function splitTrim(str) {
  return str.split(',').map(t => t.trim());
}

router.post('/movie', [
  check('title').exists().withMessage('Judul harus ada!'),
  check('year').exists().withMessage('Tahun film harus diisi.')
    .isInt().withMessage('Tahun harus diisi dengan angka'),
  check('poster').isURL().withMessage('URL Poster yang diisikan salah.')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
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
    res.json({
      success: true,
      message: 'New movie added.',
      data: { movie }
    })
  })
})

router.post('/movie/add-file', [
  check('movieId').exists().withMessage('Movie id kosong.')
    .isMongoId().withMessage('Id Movie tidak valid'),
  check('fileId').exists().withMessage('File id kosong')
    .isMongoId().withMessage('Id File tidak valid')
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid request.',
      errors: errors.formatWith(err => err.msg).mapped()
    })
  }
  let movie, file
  Promise1 = Movie.findById(req.body.movieId)
    .then(m => {
      movie = m
    })
  Promise2 = File.findById(req.body.fileId)
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
      Promise.all([movie.save(), file.save()])
        .then(() => {
          res.json({
            success: true,
            message: 'File berhasil ditambahkan'
          })
        })
    })
})

module.exports = router
