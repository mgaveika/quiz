const mongoose = require("mongoose")

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion',
        required: true
    },
    answer: {
        type: Number,
        required: true
    }
}, { _id: false })

const quizAttemptSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    answers: {
        type: [answerSchema],
        default: []
    },
    score: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema)
