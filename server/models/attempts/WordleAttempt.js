const mongoose = require('mongoose')
const GameAttemptSchema = require('./Main')

const WordleAttemptSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    maxWordleAttempts: {
        type: Number,
        default: 6
    },
    results: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            guest: String,
            username: String,
            attempts: { type: [String], default: [] },
            finished: { type: Boolean, default: false }
        }
    ]
})

module.exports = GameAttemptSchema.discriminator('wordle', WordleAttemptSchema)