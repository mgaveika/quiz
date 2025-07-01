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
        res.status(201).json(newQuizQuestion)
    } catch (err) {
        console.log(err)
    }
})

router.put('/:id', async (req, res) => {
    try {
        const quizId = req.body.quizId
        const order = req.body.order
        const updates = {
            questionText: req.body.questionText,
            options: req.body.options,
            correctAnswer: req.body.correctAnswer,
            order: req.body.order
        }
        const updatedQuizQuestion = await QuizQuestionService.updateQuizQuestion(quizId, order, updates)
        res.status(200).json(updatedQuizQuestion)
    } catch (err) {
        console.log(err)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const quizId = req.params.id
        const order = req.query.order
        if (order !== undefined) {
            await QuizQuestionService.deleteQuizQuestion(quizId, order)
        } else {
            await QuizQuestionService.deleteQuizQuestions(quizId)
        }
        res.status(204).send()
    } catch (err) {
        console.log(err)
    }
})

module.exports = router