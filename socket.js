const Chat = require('./models/chat')
const User = require('./models/user')

const onlineUsers = {}

function getOnlineUsers() {
  return Object.values(onlineUsers).filter(user => user.sockets && user.sockets.length)
}

module.exports = (io) => (client) => {
  let currentUser = null
  User.findById(client.decoded_token.id)
    .then(user => {
      if (user) {
        currentUser = user
        if(onlineUsers[user._id]) {
          onlineUsers[user._id].sockets.push(client.id)
        } else {
          onlineUsers[user._id] = {
            _id: user._id,
            username: user.username,
            email: user.email,
            sockets: [client.id]
          }
        }
        io.emit('online_users', getOnlineUsers())
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
      let index = onlineUsers[currentUser._id].sockets.indexOf(client.id)
      onlineUsers[currentUser._id].sockets.splice(index, 1)
      io.emit('online_users', getOnlineUsers())
    })
}
