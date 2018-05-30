const User = require('../models/user')
const webpush = require('web-push')
const vapidKeys = require('../config/vapid-keys')

webpush.setVapidDetails(
  'mailto:admin@inoxsegar.com',
  vapidKeys.vapidPublicKey,
  vapidKeys.vapidPrivateKey
)

async function findSubscriptions(topic) {
  const subscriptions = []
  const users = await User.find({topicSubscribed: {
    '$in': [topic]
  }})
  users.forEach(user => {
    if(!user.subscriptions) return
    user.subscriptions.forEach(subscription => {
      subscriptions.push(subscription)
    })
  })
  return subscriptions
}

async function removeSubscription(subscription) {
  const user = await User.findOne({subscriptions: {
    '$in': subscription
  }})
  const index = user.subscriptions.indexOf(subscription)
  user.subscriptions.splice(index, 1)
  return user.save()
}

module.exports = async (topic, payload) => {
  const subscriptions = await findSubscriptions(topic)
  const results = []
  for (const subscription of subscriptions) {
    const result = await webpush.sendNotification(JSON.parse(subscription), payload)
    if(result.statusCode == '404' || result.statusCode == '410') {
      await removeSubscription(subscription)
    }
    results.push(result)
  }
  return results
}