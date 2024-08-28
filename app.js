const express = require('express')
const app = express()
const socket = require('socket.io')
const path = require('path')
const http = require('http');
const server = http.createServer(app)
const io = socket(server)

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join((__dirname), 'views'))
app.set('view engine', 'ejs')

io.on('connection', (socket) => {
    console.log('User connected')
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
   socket.on('signalingMessage', (message) => {
    console.log(message)
    socket.broadcast.emit('signalingMessage', message)
   })
})

app.get('/', (req,res) => {
    res.render('index')
})

server.listen(3000)