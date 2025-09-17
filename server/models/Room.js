const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Room', RoomSchema)