const mongoose = require('mongoose')

const accessTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    expireDate: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('AccessToken', accessTokenSchema)