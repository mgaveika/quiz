const express = require("express")

const auth = require("./auth")
const user = require("./user")
const quiz = require("./quizzes")
const quizQuestion = require("./quizQuestions")
const QuizAttempt = require("./quizAttempt")

const authorized = require("../middleware/Authorized")

const router = express.Router()
router
    .use("/auth", auth)
    .use("/user", authorized, user)
    .use("/quizzes", authorized, quiz)
    .use("/quiz-questions", authorized, quizQuestion)
    .use("/quiz-attempt", authorized, QuizAttempt)

module.exports = router