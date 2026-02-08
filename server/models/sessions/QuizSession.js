const mongoose = require('mongoose')
const GameSessionSchema = require('./Main')

const QuizGameSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    currentQuestion: {
        type: Number,
        default: 0
    },
    questionStartTime: Date,
    settings: {
        timePerQuestion: {
            type: Number,
            default: 30
        }
    }
})

module.exports = GameSessionSchema.schema.path('gameData').discriminator('quiz', QuizGameSchema)
