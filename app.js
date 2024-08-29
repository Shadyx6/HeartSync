const express = require('express')
const app = express()
const socket = require('socket.io')
const path = require('path')
const http = require('http');
const server = http.createServer(app)
const io = socket(server)
const indexRouter = require('./routes/index-router')
const { v4: uuidv4 } = require('uuid');

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join((__dirname), 'views'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


let rooms = {}
let waitingUsers = []

io.on('connection', (socket) => {
    socket.on('joinRoom', () => {
        if(waitingUsers.length > 0) {
            let partner = waitingUsers.shift()
            const room = uuidv4()
            socket.join(room)
            partner.join(room)
            io.to(room).emit('joinedRoom')
        } else{
            console.log('waiting')
            waitingUsers.push(socket)
            
        }
    })
    socket.on('disconnect', () => {
        let user = waitingUsers.findIndex((value) => value.id === socket.id)
        if(user!== -1){
            waitingUsers.splice(user, 1)
        } 
    })
   socket.on('signalingMessage', (message) => {
    console.log(message)
    socket.broadcast.emit('signalingMessage', message)
   })
})

app.use('/', indexRouter)


server.listen(3000)