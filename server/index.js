const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/Users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verifyJwt = require('./middleware/Auth')
require('dotenv').config()

const app = express()
const port = process.env.PORT

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected successfully.")
}).catch((error) => {
    console.error("MongoDB connection error:", error)
})


app.use(cors({
    origin: ['http://localhost:5173'],
}))

app.use(express.json())

app.post('/api/auth/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body
    if (!email || !username || !password) {
        return res.json({ msg: "All fields are required.", msgType: "error"  })
    }
    if (password.length < 8) {
        return res.json({ msg: "Password must be at least 8 characters long.", msgType: "error"  })
    }
    if (password !== confirmPassword) {
        return res.json({ msg: "Passwords do not match.", msgType: "error"  })
    }
    const checkEmail = await User.where("email").equals(email.toLowerCase())
    if (checkEmail.length > 0) {
        return res.json({ msg: "This email is already registered.", msgType: "error"  })
    }
    const checkUsername = await User.where("username").equals(username)
    if (checkUsername.length > 0) {
        return res.json({ msg: "User with this name already exists.", msgType: "error"  })
    }
    try {
        const hashedPassword = await hashPassword(password)
        const newUser = await User.create({
            email: email.toLowerCase(),
            username: username,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date()
        })
        return res.json({ msg: "User successfully registered", msgType: "success" })
    } catch (error) {
        return res.json({ msg: error.message, msgType: "error"  })
    }
})

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

async function checkPassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.json({ msg: "Email and password are required.", msgType: "error" })
    }
    const user = await User.where("email").equals(email.toLowerCase())
    if (user.length > 0) {
        const checkedPass = await checkPassword(password, user[0].password)
        if (checkedPass) {
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' })
            return res.json({ auth: true, token: token, msg: "Login successful!", msgType: "success" })
        }
    }
    return res.json({ auth: false, msg: "Invalid email or password.", msgType: "error" })
})


app.get('/api/auth/isAuthenticated', verifyJwt, async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user) {
        return res.status(404).json({ auth: false, msg: "User not found.", msgType: "error" })
    }
    return res.json({ auth: true, user: { id: user.id, email: user.email, username: user.username, created_at: user.created_at }, msgType: "success" })
})

app.post('/api/auth/updatePassword', verifyJwt, async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.json({ msg: "All fields are required!", msgType: "error" })
    }
    if (newPassword != confirmNewPassword) {
        return res.json({ msg: "Password doesn't match.", msgType: "error" })
    }
    const user = await User.findById(req.userId)
    if (!user) {
        return res.status(404).json({ msg: "User not found.", msgType: "error" })
    }
    const checkedPass = await checkPassword(currentPassword, user.password)
    if (!checkedPass) {
        return res.json({ msg: "Invalid user's password.", msgType: "error" })
    }
    user.password = await hashPassword(newPassword)
    user.updated_at = new Date()
    await user.save()
    return res.json({msg: "Password updated successfully!", msgType: "success"})
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})