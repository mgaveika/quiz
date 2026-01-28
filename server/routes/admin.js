const express = require('express')
const AdminService = require('../services/AdminService')
const AuthService = require('../services/AuthService')
const UserService = require('../services/UserService')

const router = express.Router()

router.get('/dashboard', async (req, res) => {
    try {
        const data = await AdminService.getDashboardData()
        res.json({ data: data, message: "Recieved dashboard data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/users', async (req, res) => {
    try {
        const { page, role, search } = req.query
        const data = await AdminService.getUsers({ page, role, search })
        res.json({ data: data, message: "Recieved users data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/quizzes', async (req, res) => {
    try {
        const { page, categories, search } = req.query
        const data = await AdminService.getQuizzes({ page, categories, search })
        res.json({ data: data, message: "Recieved quizzes data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/logout/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        await AuthService.logoutUserById({ id: userId })
        res.json({ data: null, message: "User logged out successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.delete('/deleteUser/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        await UserService.deleteAccount({ id: userId })
        res.json({ data: null, message: "User deleted successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.post('/updateRole/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const { role } = req.body
        const data = await AdminService.updateRole({ userId, role })
        res.json({ data: data, message: "User role updated successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

module.exports = router