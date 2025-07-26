const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ""
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
})

module.exports = mongoose.model('Quiz', quizSchema)