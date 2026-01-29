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
        res.cookie("accessCookie", data.token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7d
        })
        res.clearCookie("guestAccessCookie")
        res.json({ data: { auth: true, user: data.user }, message: "Authentication successful.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
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
        res.json({ data: data, message: "User registered successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/isAuthenticated', authorized, async (req, res) => {
    try {
        const id = req.userId
        const data = await AuthService.getUserById({ id })
        res.json({ data: data, message: "User is authenticated.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/isAdmin', authorized, async (req, res) => {
    try {
        const data = await AuthService.isAdmin({ userId: req.userId })
        res.json({ data: data, message: "Recieved admin data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/logout', authorized, async (req, res) => {
    try {
        const id = req.userId
        await AuthService.logoutUserById({ id })
        res.clearCookie("accessCookie")
        res.json({ data: null, message: "User logged out.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/forgotPassword', authorized, async (req, res) => {
    try {
        const { email } = req.body
        const data = await AuthService.forgotPassword({ email, guestId: req.userId })
        res.json({ data: data, message: "Password reset email sent.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/verifyPasswordResetPage', authorized, async (req, res) => {
    try {
        const { token } = req.body
        const data = await AuthService.verifyPasswordResetPage({ token, userId: req.userId })
        res.json({ data: data, message: "Password reset page verified.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/verifyPasswordResetCode', authorized, async (req, res) => {
    try {
        const { code, token } = req.body
        const data = await AuthService.verifyPasswordResetCode({ code, token, userId: req.userId })
        res.json({ data: data, message: "Password reset code verified.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/resetPassword', authorized, async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body
        const data = await AuthService.resetPassword({ password, confirmPassword, token })
        res.json({ data: data, message: "Password reset successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})
module.exports = router