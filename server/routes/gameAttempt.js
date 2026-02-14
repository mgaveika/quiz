const express = require('express')
const GameAttemptService = require('../services/GameAttemptService')
const MainSession = require('../models/sessions/Main')

const router = express.Router()
const QuizService = require('../services/gameservices/QuizService')

router.get('/history', async (req, res) => {
    try {
        const guest = req.guest || false
        const userId = req.userId
        const { page, search } = req.query
        const data = await QuizService.getUserHistory({ userId, guest, page: Number(page) || 1, search })
        res.json({ data, message: "History fetched successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/', async (req, res) => {
    try {
        const guest = req.guest || false
        const userId = req.userId
        const { sessionId } = req.query
        const data = await GameAttemptService.getGameAttempt({ userId, guest, sessionId })
        res.json({ data: data, message: "Game attempt fetched successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const guest = req.guest || false
        const userId = req.userId
        const attemptId = req.params.id
        const updateData = { ...req.body, io: req.io }
        const data = await GameAttemptService.updateGameAttempt({ userId, guest, attemptId, updateData })

        if (data.allFinished) {
            const sessionId = data.attempt.session
            const session = await MainSession.findById(sessionId)
            if (session) {
                req.io.to(String(session.roomCode)).emit('game-finished', { attemptId })
            }
        }

        res.json({ data: data, message: "Game attempt updated successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const data = await GameAttemptService.getAttemptById(id)

        if (!data) throw new Error("Attempt not found")

        let isParticipant = false
        const attempt = data.attempt || data
        if (attempt.results && attempt.results.length > 0) {
            isParticipant = attempt.results.some(r => String(r.user || r.guest) === String(userId))
        } else {
            isParticipant = String(attempt.user || attempt.guest) === String(userId)
        }

        if (!isParticipant) {
            return res.status(403).json({ data: null, message: "Access denied", status: "error" })
        }

        res.json({ data: data, message: "Attempt fetched successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

module.exports = router

