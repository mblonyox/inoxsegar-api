const express = require('express')
const { query, body } = require('express-validator/check')

const Series = require('../models/series')
const File = require('../models/file')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr, sendNotif } = require('../helpers')

const router = express.Router()

router.use(verifyToken)

//#region Get Series
router.get('/', [
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
//#endregion

//#region Get Series Details
router.get('/:seriesId', (req, res) => {
  Series.findById(req.params.seriesId)
    .populate({
      path: 'seasons.episodes.files',
      populate: {
        path: 'uploader',
        select: 'username _id'
      }
    })
    .then(series => {
      return res.json({
        success: true,
        message: 'series found!',
        data: { series }
      })
    })
    .catch(catchErr(res))
})
//#endregion

function splitTrim(str) {
  return str.split(',').map(t => t.trim());
}

//#region Post New Series
router.post('/', [
  body('title').exists().withMessage('Judul harus ada!'),
  body('year').exists().withMessage('Tahun serial harus diisi.'),
  body('poster').isURL().withMessage('URL Poster yang diisikan salah.'),
  checkValidation
], (req, res) => {
  const newSeries = new Series({
    category: req.body.category,
    imdb: req.body.imdb ? req.body.imdb : undefined,
    tvdb: req.body.tvdb ? req.body.tvdb : undefined,
    mal: req.body.mal ? req.body.mal : undefined,
    category: req.body.category,
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
    status: req.body.status,
    runtime: req.body.runtime,
    imdbRating: req.body.rating,
    imdbVotes: req.body.votes,
    uploader: req.user._id
  })

  newSeries.save()
  .then(series => {
    const payload = JSON.stringify({
      title: 'InoxSegar - New Series!',
      body: `${series.title} (${series.year}) - ${series.plot}`,
      image: series.poster,
      url: '/series/' + series._id
    })
    sendNotif('series', payload)
    return res.json({
      success: true,
      message: 'New series added.',
      data: { series }
    })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Post Series New Season
router.post('/:seriesId/seasons', (req, res) => {
  Series.findById(req.params.seriesId)
  .then(series => {
    const episodes = []
    for (let i = 1; i <= req.body.episodes; i++) {
      episodes.push({
        name: `Episode ${i}`,
        number: i
      })
    }
    series.seasons.push({
      name: req.body.name,
      number: req.body.number,
      images: req.body.images,
      episodes
    })
    return series.save()
  })
  .then(series => {
    return res.json({
      success: true,
      message: 'Seasons added.',
      data: { series }
    })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Post Series New Episode
router.post('/:seriesId/seasons/:seasonId/episodes', (req, res) => {
  Series.findById(req.params.seriesId)
  .then(series => {
    const season = series.seasons.id(req.params.seasonId)
    season.episodes.push({
      name: req.body.name,
      number: req.body.number,
      aired: req.body.aired,
    })
    return series.save()
  })
  .then(series => {
    return res.json({
      success: true,
      message: 'Episode added.',
      data: { series }
    })
  })
  .catch(catchErr(res))
})
//#endregion

//#region Post Series File
router.post('/:seriesId/seasons/:seasonId/episodes/:episodeId', (req, res) => {
  const seriesPromise = Series.findById(req.params.seriesId).populate({
      path: 'seasons.episodes.files',
      populate: {
        path: 'uploader',
        select: 'username _id'
      }
    })
  const filePromise = File.findById(req.body.fileId).populate({
      path: 'uploader',
      select: '_id username'
    })

  Promise.all([seriesPromise, filePromise])
    .then(([series, file]) => {
      const season = series.seasons.id(req.params.seasonId)
      const episode = season.episodes.id(req.params.episodeId)

      episode.files.push(file._id)
      file.koleksi = {
        data: series._id,
        tipe: 'Series'
      }

      return Promise.all([series.save(), file.save()])
    })
    .then(([series, file]) => {
      return res.json({
        success: true,
        message: 'File berhasil ditambahkan',
        data: {series, file}
      })
    })
    .catch(catchErr(res))
})
//#endregion

module.exports = router
