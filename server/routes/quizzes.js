const express = require('express')
const QuizService = require('../services/QuizService')


const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const data = await QuizService.createQuiz({
            title: req.body.title,
            description: req.body.description,
            creator: req.userId
        })
        res.json({ data: data, message: "Quiz created successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/', async (req, res) => {
    try {
        const data = await QuizService.getUserQuizzes(req.userId)
        res.json({ data: data, message: "Recieved user quizzes.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const data = await QuizService.getQuizById(req.params.id)
        res.json({ data: data, message: `Recieved quiz with ID: ${req.params.id}`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const data = await QuizService.updateQuiz(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            creator: req.userId
        })
        res.json({ data: data, message: "Quiz updated successfully!", status: "success"  })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const data = await QuizService.deleteQuiz(req.params.id, req.userId)
        res.json({ data: data, message: "Quiz deleted successfully", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router