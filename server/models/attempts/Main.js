const mongoose = require('mongoose')

const GameAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        guest: String,
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GameSession'
        }
    },
    {
        discriminatorKey: 'gameType',
        timestamps: true
    }
)

GameAttemptSchema.index({ gameType: 1 })

module.exports = mongoose.model('GameAttempt', GameAttemptSchema)
