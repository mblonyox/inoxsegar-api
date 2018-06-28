const Chat = require('./models/chat')
const User = require('./models/user')

function getOnlineUsers(sockets) {
  return Object.values(sockets)
    .reduce((users, socket) => {
      if(socket.user && !users.some(user => user._id.toString() === socket.user._id.toString())) {
        users.push({
          _id: socket.user._id,
          username: socket.user.username,
          email: socket.user.email
        })
      }
      return users
    }, [])
}

module.exports = (io) => (client) => {
  User.findById(client.decoded_token.id)
    .then(user => {
      if (user) {
        client.user = user
      }
      io.emit('online_users', getOnlineUsers(io.sockets.connected))
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
      io.emit('online_users', getOnlineUsers(io.sockets.connected))
    })
}
