const mongoose = require('mongoose')

const ParticipantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guest: String,
    username: String,
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameAttempt' }
})

const GameDataSchema = new mongoose.Schema(
    {},
    { discriminatorKey: 'gameType', _id: false }
)

const GameSessionSchema = new mongoose.Schema({
    roomCode: {
        type: Number,
        required: true
    },
    participants: [ParticipantSchema],
    status: {
        type: String,
        enum: ['waiting', 'in-progress', 'completed'],
        default: 'waiting'
    },
    gameType: {
        type: String,
        enum: ['quiz', 'wordle'],
        required: true
    },
    userHost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    guestHost: String,
    gameData: GameDataSchema
}, { timestamps: true })

module.exports = mongoose.model('GameSession', GameSessionSchema)
