const express = require("express")

const auth = require("./auth")
const user = require("./user")
const quiz = require("./quizzes")
const quizQuestion = require("./quizQuestions")
const quizAttempt = require("./quizAttempt")
const room = require("./room")
const authorized = require("../middleware/Authorized")
const guestMiddleware = (req, res, next) => {
    req.allowGuest = true
    next()
}
const router = express.Router()

router
    .use("/auth", auth)
    .use("/user", authorized, user)
    .use("/quizzes", guestMiddleware, authorized, quiz)
    .use("/quiz-questions", guestMiddleware, authorized, quizQuestion)
    .use("/quiz-attempt", guestMiddleware, authorized, quizAttempt)
    .use("/room", guestMiddleware, authorized, room)

module.exports = router