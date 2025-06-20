const express = require('express')
const authorized = require('../middleware/Authorized')
const AuthService = require('../services/AuthService')

const router = express.Router()

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const data = await AuthService.login({
            email,
            password
        })
        res.json(data)
    } catch (err) {
        console.log(err)
        res.json({ msg: err.message, msgType: "error" })
    }
})

router.post('/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body
    try {
        const data = await AuthService.register({
            email, 
            username, 
            password, 
            confirmPassword
        })
        res.json(data)
    } catch (err) {
        console.log(err)
        res.json({ msg: err.message, msgType: "error"  })
    }
})

router.get('/isAuthenticated', authorized, async (req, res) => {
    try {
        const id = req.userId
        const data = await AuthService.isAuth({id})
        res.json(data)
    } catch (err) {
        console.log(err)
        res.json({ msg: err.message, msgType: "error"  })
    }
})

module.exports = router