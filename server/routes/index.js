const express = require('express')

const auth = require('./auth')
const user = require('./user')

const authorized = require('../middleware/Authorized')

const router = express.Router()
router
    .use('/auth', auth)
    .use('/user', authorized, user)

module.exports = router