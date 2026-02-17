const express = require('express')
const GameSessionService = require('../services/GameSessionService')
const Users = require('../models/Users')

const router = express.Router()

router.post('/create', async (req, res) => {
    try {
        const userId = req.userId
        const guest = req.guest || false
        const { gameType, ...gameData } = req.body
        const data = await GameSessionService.createGameSession({ userId, guest, gameType, gameData })
        res.json({ data: data, message: "Game session created", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get("/:code", async (req, res) => {
    try {
        const { code } = req.params
        const session = await GameSessionService.getGameSessionByCode({ roomCode: code })
        if (!session) {
            return res.json({ data: null, message: "Session not found", status: "error" })
        }

        const userId = req.userId
        const isHost = (session.userHost && String(session.userHost) === String(userId)) || (session.guestHost === userId)

        const isParticipant = session.participants.some(p =>
            (p.user && String(p.user) === String(userId)) ||
            (p.guest && String(p.guest) === userId)
        )

        if (session.status === 'in-progress' && !isParticipant && !isHost) {
            return res.json({ data: null, message: "You are not a participant in this game", status: "error" })
        }

        const host = session.userHost ? await Users.findById(session.userHost).select('username') : null

        let quizQuestions = []
        if (session.gameType === 'quiz' && session.gameData.quizId) {
            const QuizQuestion = require('../models/QuizQuestion')
            quizQuestions = await QuizQuestion.find({ quizId: session.gameData.quizId._id }).sort({ order: 1 })
        }

        res.json({
            data: {
                session,
                quizQuestions,
                isCreator: isHost,
                hostName: host?.username || session.guestHost || "Unknown",
                userId: userId,
                quiz: session.gameData.quizId // For convenience
            },
            message: "Game session fetched",
            status: "success"
        })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})
router.post("/:code/start", async (req, res) => {
    try {
        const { code } = req.params
        const { settings, participants } = req.body
        const session = await GameSessionService.getGameSessionByCode({ roomCode: code })
        if (!session) {
            return res.json({ message: "Session not found", status: "error" })
        }
        const isCreator = (session.userHost && String(session.userHost) === String(req.userId)) || (session.guestHost === req.userId)
        if (!isCreator) {
            return res.json({ message: "Access denied", status: "error" })
        }
        await GameSessionService.startGame({ roomCode: code, settings, participants })
        res.json({ message: "Game started", status: "success" })
    } catch (err) {
        res.json({ message: err.message, status: "error" })
    }
})
router.delete("/:code", async (req, res) => {
    try {
        const { code } = req.params
        const session = await GameSessionService.getGameSessionByCode({ roomCode: code })
        if (!session) {
            return res.json({ data: null, message: "Session not found", status: "error" })
        }
        const isCreator = (session.userHost && String(session.userHost) === String(req.userId)) || (session.guestHost === req.userId)
        if (!isCreator) {
            return res.json({ data: null, message: "Access denied", status: "error" })
        }
        await GameSessionService.deleteGameSession({ roomCode: code })
        res.json({ data: null, message: "Game session deleted", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})


router.get("/:code/status", async (req, res) => {
    try {
        const { code } = req.params
        const status = await GameSessionService.getGameStatus({ roomCode: code })
        res.json({ data: status, message: "Game status fetched", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})
router.get("/draw/words", async (req, res) => {
    try {
        const { roomCode } = req.query
        const DrawService = require('../services/gameservices/DrawService')

        if (roomCode) {
            const GameSession = require('../models/sessions/Main')
            const session = await GameSession.findOne({ roomCode: Number(roomCode) })
            if (session && session.gameData && session.gameData.wordChoices && session.gameData.wordChoices.length > 0) {
                return res.json({ data: session.gameData.wordChoices, status: "success" })
            }
        }

        const words = await DrawService.getRandomWords(3)
        res.json({ data: words, status: "success" })
    } catch (err) {
        res.json({ data: [], message: err.message, status: "error" })
    }
})

module.exports = router
