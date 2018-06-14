const express = require('express')
const { body } = require('express-validator/check')

const vapid = require('../config/vapid-keys')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const router = express.Router()

router.get('/vapid-key', (req, res) => {
  res.send(vapid.vapidPublicKey);
})

router.use(verifyToken)

router.post('/register', [
  body('subscription').exists(),
  checkValidation
], (req, res, next) => {
  const user = req.user
  const subscriptions = user.subscriptions || []
  if (!subscriptions.includes(req.body.subscription)) {
    subscriptions.push(req.body.subscription)
  }
  user.subscriptions = subscriptions
  user.save()
    .then(user => {
      return res.json({
        success: true,
        message: 'Register push berhasil disimpan.',
        data: {user}
      })
    })
    .catch(next)
})

router.post('/unregister', [
  body('subscription').exists(),
  checkValidation
], (req, res, next) => {
  const user = req.user
  const subscriptions = user.subscriptions
  const index = subscriptions.indexOf(req.body.subscription)
  user.subscriptions.splice(index, 1)
  user.save()
    .then(user => {
      return res.json({
        success: true,
        message: 'Unregister push berhasil disimpan.',
        data: {user}
      })
    })
    .catch(next)
})

router.post('/subscribe', [
  body('topic').exists(),
  checkValidation
], (req, res, next) => {
  const user = req.user
  const topics = user.topicSubscribed || []
  if (!topics.includes(req.body.topic)) {
    topics.push(req.body.topic)
  }
  user.topicSubscribed = topics
  user.save()
    .then(user => {
      return res.json({
        success: true,
        message: 'Langganan berhasil disimpan.',
        data: {user}
      })
    })
    .catch(next)
})

router.post('/unsubscribe', [
  body('topic').exists(),
  checkValidation
], (req, res, next) => {
  const user = req.user
  const topics = user.topicSubscribed
  const index = topics.indexOf(req.body.topic)
  user.topicSubscribed.splice(index, 1)
  user.save()
    .then(user => {
      return res.json({
        success: true,
        message: 'Berhenti langganan berhasil disimpan.',
        data: {user}
      })
    })
    .catch(next)
})

module.exports = router