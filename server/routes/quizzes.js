const express = require('express')
const QuizService = require('../services/QuizService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const {title,description,participants,visibility,categories} = req.body
        const data = await QuizService.createQuiz({
            title,
            description,
            creator: req.userId,
            participants,
            visibility,
            categories
        })
        res.json({ data: data, message: "Quiz created successfully.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/', async (req, res) => {
    try {
        const userId = req.userId
        const privateQuizzes = await QuizService.getUserQuizzes({userId})
        const publicQuizzes = await QuizService.getPublicQuizzes({userId})
        res.json({ data: {privateQuizzes, publicQuizzes}, message: "Recieved all quizzes.", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const data = await QuizService.getQuizById({id, userId: req.userId})
        res.json({ data: data, message: `Recieved quiz with ID: ${id}`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const {title,description,participants,visibility,categories} = req.body
        const {id} = req.params
        const data = await QuizService.updateQuiz({id, updatedData: {
            title,
            description,
            creator: req.userId,
            participants,
            visibility,
            categories
        }})
        res.json({ data: data, message: "Quiz updated successfully!", status: "success"  })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const data = await QuizService.deleteQuiz({id, userId: req.userId})
        res.json({ data: data, message: "Quiz deleted successfully", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router