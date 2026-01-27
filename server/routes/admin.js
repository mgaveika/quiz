const express = require('express')
const AdminService = require('../services/AdminService')

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
        const { page } = req.query
        const data = await AdminService.getUsers({ page })
        res.json({ data: data, message: "Recieved users data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/quizzes', async (req, res) => {
    try {
        const { page } = req.query
        const data = await AdminService.getQuizzes({ page })
        res.json({ data: data, message: "Recieved quizzes data.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

module.exports = router