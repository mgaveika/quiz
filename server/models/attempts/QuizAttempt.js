const mongoose = require('mongoose')
const GameAttemptSchema = require('./Main')

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion',
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { _id: false })

const QuizAttemptSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    answers: {
        type: [answerSchema],
        default: []
    },
    score: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: -1
    }
})

module.exports = GameAttemptSchema.discriminator('quiz', QuizAttemptSchema)
