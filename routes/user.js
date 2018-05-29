const express = require('express')
const { query, body } = require('express-validator/check')

const vapid = require('../config/vapid-keys')
const verifyToken = require('../middlewares/verify_token')
const checkValidation = require('../middlewares/check_validation')
const { catchErr } = require('../helpers')

const router = express.Router()


router.get('/push/vapid-key', (req, res) => {
  res.send(vapid.vapidPublicKey);
})

router.use(verifyToken)

/* GET users listing. */
router.get('/user',(req, res) => {
  res.send('respond with a resource');
})

router.post('/push/register', [
  body('subscription').exists(),
  checkValidation
], (req, res) => {
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
    .catch(catchErr(res))
})

router.post('/push/unregister', [
  body('subscription').exists(),
  checkValidation
], (req, res) => {
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
    .catch(catchErr(res))
})

router.post('/push/subscribe', [
  body('topic').exists(),
  checkValidation
], (req, res) => {
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
    .catch(catchErr(res))
})

router.post('/push/unsubscribe', [
  body('topic').exists(),
  checkValidation
], (req, res) => {
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
    .catch(catchErr(res))
})

module.exports = router
