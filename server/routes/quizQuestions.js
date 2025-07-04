const express = require('express')
const QuizQuestionService = require('../services/QuizQuestionService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const newQuizQuestion = await QuizQuestionService.createQuizQuestion({
            questionText: req.body.questionText,
            options: req.body.options,
            correctAnswer: req.body.correctAnswer,
            quizId: req.body.quizId,
            order: req.body.order
        })
        res.json({ data: newQuizQuestion, message: "Question created successfully!" , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const updatedQuizQuestion = await QuizQuestionService.updateQuizQuestion(req.body.quizId, req.body.order, {
            questionText: req.body.questionText,
            options: req.body.options,
            correctAnswer: req.body.correctAnswer,
            order: req.body.order
        })
        res.json({ data: updatedQuizQuestion, message: "Question updated successfully!" , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const quizId = req.params.id
        const order = req.query.order
        if (order !== undefined) {
            await QuizQuestionService.deleteQuizQuestion(quizId, order)
            res.json({ data: null, message: "Question deleted successfully!" , status: "success" })
        } else {
            await QuizQuestionService.deleteQuizQuestions(quizId)
            res.json({ data: null, message: "Questions deleted successfully!" , status: "success" })
        }
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router