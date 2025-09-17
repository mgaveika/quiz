const express = require('express')
const QuizQuestionService = require('../services/QuizQuestionService')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const {questionText,options,quizId,order,answerType} = req.body
        const newQuizQuestion = await QuizQuestionService.createQuizQuestion({
            questionText,
            options,
            quizId,
            order,
            answerType
        })
        res.json({ data: newQuizQuestion, message: "Question created successfully!" , status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {order} = req.query
        if (order !== undefined) {
            await QuizQuestionService.deleteQuizQuestion({quizId: id, order})
            res.json({ data: null, message: "Question deleted successfully!", status: "success" })
        } else {
            await QuizQuestionService.deleteQuizQuestions({quizId: id})
            res.json({ data: null, message: "Questions deleted successfully!", status: "success" })
        }
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router