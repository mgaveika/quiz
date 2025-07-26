const express = require('express')
const QuizAttemptService = require('../services/QuizAttemptService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const data = await QuizAttemptService.createQuizAttempt(req.body.quizId, req.userId)
        res.json({ data: data, message: "Quiz attempt created successfully!" , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const data = await QuizAttemptService.updateQuizAttempt(
            req.params.id, 
            req.body.questionId, 
            req.body.answer
        )
        res.json({ data: data, message: "Quiz answer data saved successfully." , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const data = await QuizAttemptService.getQuizAttempt(req.params.id)
        res.json({ data: data, message: "Recieved user quizzes.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router