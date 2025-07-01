const express = require('express')
const QuizService = require('../services/QuizService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const newQuiz = await QuizService.createQuiz({
            title: req.body.title,
            creator: req.userId
        })
        if (!newQuiz || newQuiz.msgType === "error") {
            return res.json(newQuiz)
        }
        res.json(newQuiz)
    } catch (err) {
        res.json({ msg: err.message, msgType: "error" })
    }
})

router.get('/', async (req, res) => {
    try {
        const quizzes = await QuizService.getUserQuizzes(req.userId)
        res.json(quizzes)
    } catch (err) {
        res.json({ msg: err.message, msgType: "error" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const quiz = await QuizService.getQuizById(req.params.id)
        if (!quiz) {
            return res.status(404).json({ msg: "Quiz not found", msgType: "error" })
        }
        res.json(quiz)
    } catch (err) {
        res.json({ msg: err.message, msgType: "error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const updatedQuiz = await QuizService.updateQuiz(req.params.id, {
            title: req.body.title,
            creator: req.userId
        })
        if (!updatedQuiz) {
            return res.json({ msg: "Quiz not found", msgType: "error"  })
        }
        res.json({ msg: "Quiz updated successfully!", msgType: "success"  })
    } catch (err) {
        res.json({ msg: err.message, msgType: "error" })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedQuiz = await QuizService.deleteQuiz(req.params.id, req.userId)
        if (deletedQuiz.msg) {
            return res.json(deletedQuiz)
        }
        res.json({ msg: "Quiz deleted successfully", msgType: "success" })
    } catch (err) {
        res.json({ msg: err.message, msgType: "error" })
    }
})

module.exports = router