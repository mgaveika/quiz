const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const routes = require('./routes')
const cookieParser = require('cookie-parser')

const socketPort = 8080
const http = require('http')
const { Server } = require("socket.io")
const server = http.createServer(app)
const authMiddleware = require("./middleware/Authorized.js")

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3303",
    methods: ["GET", "POST"],
    credentials: true
  },
})
io.use(wrap(authMiddleware))

server.listen(socketPort, () => {
    console.log(`WebSocket is running on port ${socketPort}`)

})

require('./socket/roomEvents.js')(io)

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected successfully.")
}).catch((error) => {
    console.error("MongoDB connection error:", error)
})

app.use(cors({
    origin: ['http://localhost:5173'],
}))

app.use(express.json())
app.use(cookieParser())
app.use('/api', routes)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})