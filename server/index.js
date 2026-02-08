const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const routes = require('./routes')
const cookieParser = require('cookie-parser')
const morganMiddleware = require('./middleware/Morgan.js')
const socketPort = 8080
const http = require('http')
const { Server } = require("socket.io")
const server = http.createServer(app)
const authMiddleware = require("./middleware/Authorized.js")
const guestMiddleware = (req, res, next) => {
  req.allowGuest = true
  next()
}

// Load models
require('./models/attempts/Models.js')
require('./models/sessions/Models.js')

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3300", "http://localhost:3303"],
    methods: ["GET", "POST"],
    credentials: true
  },
})

io.use(wrap(cookieParser()))
io.use(wrap(guestMiddleware))
io.use(wrap(authMiddleware))

require('./socket/roomEvents.js')(io)

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected successfully.")
}).catch((error) => {
  console.error("MongoDB connection error:", error)
})

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3300", "http://localhost:3303"],
  credentials: true
}))

app.use(express.json())
app.use((req, res, next) => {
  req.io = io
  next()
})
app.use(morganMiddleware)
app.use(cookieParser())
app.use('/api', routes)

const finalPort = process.env.PORT || 3000
server.listen(finalPort, () => {
  console.log(`Server is running at http://localhost:${finalPort}`)
})