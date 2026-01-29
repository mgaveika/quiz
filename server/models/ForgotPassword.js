const mongoose = require('mongoose')

const forgotPasswordSchema = new mongoose.Schema({
    guest: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        expires: "15m",
        default: Date.now()
    }
})

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema)