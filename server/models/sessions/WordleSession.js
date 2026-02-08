const mongoose = require('mongoose')
const GameSessionSchema = require('./Main')

const WordleGameSchema = new mongoose.Schema({
    word: String,
    settings: {
        wordLength: {
            type: Number,
            default: 5
        },
        wordleAttempts: {
            type: Number,
            default: 6
        }
    }
})

module.exports = GameSessionSchema.schema.path('gameData').discriminator('wordle', WordleGameSchema)
