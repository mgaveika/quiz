const express = require("express")

const auth = require("./auth")
const user = require("./user")
const quiz = require("./quizzes")
const quizQuestion = require("./quizQuestions")
const quizAttempt = require("./quizAttempt")
const room = require("./room")
const authorized = require("../middleware/Authorized")

const router = express.Router()

router
    .use("/auth", auth)
    .use("/user", authorized, user)
    .use("/quizzes", authorized, quiz)
    .use("/quiz-questions", authorized, quizQuestion)
    .use("/quiz-attempt", authorized, quizAttempt)
    .use("/room", authorized, room)

module.exports = router