const express = require('express')
const QuizAttemptService = require('../services/QuizAttemptService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const {quizId} = req.body
        const data = await QuizAttemptService.createQuizAttempt({quizId, userId: req.userId})
        res.json({ data: data, message: "Quiz attempt created successfully!" , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {questionId, answer, rating} = req.body
        const data = await QuizAttemptService.updateQuizAttempt( {attemptId: id, questionId, answer, rating})
        res.json({ data: data, message: "Data saved successfully." , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/', async (req, res) => {
    try {
        const data = await QuizAttemptService.getUserAttempts({userId: req.userId})
        res.json({ data: data, message: "Recieved user attempts.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const data = await QuizAttemptService.getQuizAttempt({attemptId: id})
        res.json({ data: data, message: "Recieved user attempt.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})


module.exports = router