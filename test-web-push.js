const webpush = require('web-push')
const vapidKeys = require('./config/vapid-keys')

webpush.setVapidDetails(
  'mailto:mblonyox@gmail.com',
  vapidKeys.vapidPublicKey,
  vapidKeys.vapidPrivateKey
)

const string = '{"endpoint":"https://fcm.googleapis.com/fcm/send/fY5Shj1GqO0:APA91bHOZuDN7IoIk7Mm1-F-Ft6OWrDEPzqtLs2Cgx6BpqlpAqI3BDJMMAXA9MijEdaCzqSKU7y_yOjvluF3JqjZfMfYWkqxbfD7rNqjscH9il6k-gsVN8tA14vN14O51UyDitmPX_iD","expirationTime":null,"keys":{"p256dh":"BNsTQcMrD7lGgRQli2xxvxSelRvi1M_ZRgup-vZMaa77uCRWiA1ZbDsU8_faX-o2H__iWwYEei0F9MTN6q0cbbE","auth":"9G45yDahzxQ6zVqyXbUqzg"}}'
const subscription = JSON.parse(string)

const payload = JSON.stringify({
  title: 'Testing Web Push!',
  body: 'Ini cuma test web push.',
  icon: '/static/img/icons/favicon-96x96.png'
})

webpush.sendNotification(subscription, payload)