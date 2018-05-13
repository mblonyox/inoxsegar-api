const express = require('express')
const { query, body } = require('express-validator/check')

const Series = require('../models/series')
const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr } = require('../helpers')

const router = express.Router()

router.use(verifyToken)

router.get('/series', [
  query('search').isLength({max: 40}).optional(),
  query('page').isInt({min: 1}).optional(),
  query('limit').isInt({min: 5, max: 100}).optional(),
  query('sort').isIn(['date', 'size']).optional(),
  checkValidation
], (req, res) => {
  const search = req.query.search || ''
  const limit = req.query.limit || 20
  const page = req.query.page || 1

  Series.find({
    title: {
      '$regex': search
    }
  })
  .skip((page - 1) * limit)
  .limit(limit)
  .sort('-_id')
  .populate()
  .then(series => {
    return res.json({
      success: true,
      message: 'Series found!',
      data: { series }
    })
  })
  .catch(catchErr(res))
})

function splitTrim(str) {
  return str.split(',').map(t => t.trim());
}

router.post('/series', [
  body('title').exists().withMessage('Judul harus ada!'),
  body('year').exists().withMessage('Tahun film harus diisi.'),
  body('poster').isURL().withMessage('URL Poster yang diisikan salah.'),
  checkValidation
], (req, res) => {
  const newSeries = new Series({
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
    imdbRating: req.body.rating,
    imdbVotes: req.body.votes,
    uploader: req.user._id
  })

  newSeries.save()
  .then(series => {
    return res.json({
      success: true,
      message: 'New series added.',
      data: { series }
    })
  })
  .catch(catchErr(res))
})

module.exports = router
