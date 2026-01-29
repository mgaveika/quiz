const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: true
    },
    guest: {
        type: String,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    gameType: {
        type: String,
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
    }
}, { timestamps: true })

module.exports = mongoose.model('Room', RoomSchema)