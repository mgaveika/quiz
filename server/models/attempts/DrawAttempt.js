const mongoose = require('mongoose')
const GameAttemptSchema = require('./Main')

const DrawingTurnSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    drawer: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guest: String,
        username: String
    },
    canvasData: {
        type: String,
        default: ""
    },
    firstGuesser: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guest: String,
        username: String
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const DrawAttemptSchema = new mongoose.Schema({
    rounds: {
        type: Number,
        default: 1
    },
    timePerRound: {
        type: Number,
        default: 60
    },
    drawings: [DrawingTurnSchema],
    results: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            guest: String,
            username: String,
            score: {
                type: Number,
                default: 0
            },
            finished: {
                type: Boolean,
                default: false
            }
        }
    ]
})

module.exports = GameAttemptSchema.discriminator('draw', DrawAttemptSchema)
