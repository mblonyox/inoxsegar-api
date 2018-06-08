const Chat = require('./models/chat')
const User = require('./models/user')

module.exports = (io) => (client) => {
  let currentUser = null
  User.findById(client.decoded_token.id)
    .then(user => {
      if (user) {
        currentUser = user
        io.emit('system_message', {
          text: `${user.username} telah bergabung.`,
          time: Date.now()
        })
      }
    })

  Chat.find()
    .sort('-_id')
    .populate({path: 'sender', select: '_id username email'})
    .then(chats => {
      client.emit('old_messages', chats.reverse())
    })

  client.on('send_message', (message, cb) => {
    const newChat = new Chat({
      sender: client.decoded_token.id,
      text: message
    })
    newChat.save()
      .then(chat => chat.populate({path: 'sender', select: '_id username email'}).execPopulate())
      .then(chat => {
        client.broadcast.emit('new_message', chat)
        cb(chat)
      })
  })
    .on('disconnect', (reason) => {
      client.broadcast.emit('system_message', {
        text: `${currentUser.username} terputus.`,
        time: Date.now()
      })
    })
}
