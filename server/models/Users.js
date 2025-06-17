const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        immunable: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Users', userSchema)