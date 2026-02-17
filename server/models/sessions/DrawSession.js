const mongoose = require('mongoose')
const GameSessionSchema = require('./Main')

const DrawGameSchema = new mongoose.Schema({
    settings: {
        rounds: {
            type: Number,
            default: 1
        },
        timePerRound: {
            type: Number,
            default: 60
        }
    },
    currentRound: {
        type: Number,
        default: 1
    },
    roundStartTime: {
        type: Date
    },
    currentDrawer: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guest: String,
        username: String
    },
    wordChoices: [String],
    currentWord: String
})

module.exports = GameSessionSchema.schema.path('gameData').discriminator('draw', DrawGameSchema)
