const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3001
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {addUser, getUser, getUsersinRoom, removeUser} = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//let count = 0
io.on('connection', (socket) => {

    //socket.emit('message', generateMessage('welcome'))

    //socket.broadcast.emit('message', generateMessage('a new user has joined'))

    socket.on('join', ({username, room}, callback) => {
        const {user, error} = addUser({id: socket.id, username: username, room: room})
        if (error) {
            callback(error)
            return
        }
        socket.join(room)
        socket.emit('messageReceived', generateMessage('welcome', username))
        socket.broadcast.to(room).emit('messageReceived', generateMessage(username + ' has joined a room', username))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersinRoom(user.room)
        })
        callback()
    })
    socket.on('messagesent', (messagesent, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(messagesent)) {
            return callback('is not allowed')
        }
        io.to(user.room).emit('messageReceived', generateMessage(messagesent,user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('messageReceived', generateMessage(`${user.username} has left`,user.username))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersinRoom(user.room)
            })
        }
    })
    //console.log('new websocket connection')
    //transfer data event emit

    /*socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++
        //socket.emit('countUpdated', count)
        io.emit('countUpdated', count)
    })

    socket.on('decrement', () => {
        count--
        //socket.emit('countUpdated', count)
        io.emit('countUpdated', count)
    })*/
})


server.listen(PORT, () => {
    console.log('app started on port' + PORT)
})

