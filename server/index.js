const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const routes = require('./routes')
const cookieParser = require('cookie-parser')

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