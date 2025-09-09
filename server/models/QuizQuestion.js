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
    options: [{
        option: { type: String, required: true },
        correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }
    }],
    order: {
        type: Number,
        required: true
    },
    answerType: {
        type: String,
        //enum: ['single', 'multi', 'connection'],
        required: true
    }
})

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema)