const mongoose = require('mongoose')

const quizQuestionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: Number,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema)