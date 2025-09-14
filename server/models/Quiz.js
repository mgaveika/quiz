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
    },
    participants: [{
        name: String,
        user: String
    }],
    visibility: {
        type: Boolean,
        required: true
    },
    categories: {
        type: [String],
    }
})

module.exports = mongoose.model('Quiz', quizSchema)