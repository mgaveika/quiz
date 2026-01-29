const bcrypt = require("bcrypt")
const User = require("../models/Users")
const jwt = require("jsonwebtoken")
const accessTokenSchema = require("../models/AccessTokens")
const forgotPasswordSchema = require("../models/ForgotPassword")
const moment = require("moment")
const { MailtrapClient } = require("mailtrap")

const client = new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN,
})

const sender = {
    email: "hello@demomailtrap.co",
    name: "Mailtrap Test",
}

async function checkPassword({ password, hashedPassword }) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

async function hashPassword({ password }) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

class AuthService {
    static async createToken({ userId, username }) {
        await accessTokenSchema.deleteMany({ userId: userId })
        const user = await User.findById(userId)
        const newToken = jwt.sign({ userId: userId, username: username, role: user.role }, process.env.JWT_SECRET)
        let today = moment()
        today.add(7, "days")
        await accessTokenSchema.create({ userId: userId, username: username, token: newToken, expireDate: today, role: user.role })
        return newToken
    }
    static async login({ email, password }) {
        try {
            if (!email || !password) {
                throw new Error("Email and password are required.")
            }
            const user = await User.where("email").equals(email.toLowerCase())
            if (user.length > 0) {
                const checkedPass = await checkPassword({ password, hashedPassword: user[0].password })
                if (checkedPass) {
                    const token = await this.createToken({ userId: user[0].id, username: user[0].username, role: user[0].role })
                    return { token: token, user: user[0] }
                }
            }
            throw new Error("Invalid email or password.")
        } catch (err) {
            throw err
        }
    }

    static async register({ email, username, password, confirmPassword }) {
        try {
            if (!email || !username || !password) {
                throw new Error("All fields are required.")
            }
            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters long.")
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords doesn't match.")
            }
            const checkEmail = await User.where("email").equals(email.toLowerCase())
            if (checkEmail.length > 0) {
                throw new Error("This email is already registered.")
            }
            const checkUsername = await User.where("username").equals(username)
            if (checkUsername.length > 0) {
                throw new Error("User with this name already exists.")
            }
            const hashedPassword = await hashPassword({ password })
            const newUser = await User.create({
                email: email.toLowerCase(),
                username: username,
                password: hashedPassword
            })
            return newUser
        } catch (err) {
            throw err
        }
    }

    static async forgotPassword({ email, guestId }) {
        try {
            const lowerCaseEmail = email.toLowerCase()
            const user = await User.where("email").equals(lowerCaseEmail)
            if (user.length <= 0) {
                throw new Error("User not found.")
            }
            const existingResetPage = await forgotPasswordSchema.findOne({ email: lowerCaseEmail })
            if (existingResetPage) {
                return existingResetPage.token
            }
            const code = Math.floor(100000 + Math.random() * 900000)
            client
                .send({
                    from: sender,
                    to: [{ email: "marisgaveika2@gmail.com" }],
                    subject: "Password recovery code",
                    text: `Your password recovery code is: ${code}`,
                    category: "Password recovery",
                })
                .then(console.log, console.error);
            const mailToken = jwt.sign({ guestId, email: lowerCaseEmail }, process.env.JWT_SECRET)
            await forgotPasswordSchema.create({
                guest: guestId,
                email: lowerCaseEmail,
                code,
                token: mailToken
            })
            return mailToken
        } catch (err) {
            throw err
        }
    }

    static async verifyPasswordResetPage({ token, userId }) {
        try {
            const data = await forgotPasswordSchema.findOne({ token, guest: userId })
            if (!data) {
                throw new Error("Page not found.")
            }
            return { verified: data.verified }
        } catch (err) {
            throw err
        }
    }

    static async verifyPasswordResetCode({ code, token, userId }) {
        try {
            const data = await forgotPasswordSchema.findOne({ guest: userId, token })
            if (!data) {
                throw new Error("Page not found.")
            }
            if (data.code !== code) {
                throw new Error("Invalid code.")
            }
            data.verified = true
            data.save()
            return true
        } catch (err) {
            throw err
        }
    }

    static async resetPassword({ password, confirmPassword, token }) {
        try {
            if (!password || !confirmPassword) {
                throw new Error("All fields are required!")
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords doesn't match.")
            }
            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters long.")
            }
            const data = await forgotPasswordSchema.findOne({ token: token })
            if (!data) {
                throw new Error("Page not found.")
            }
            const user = await User.findOne({ email: data.email })
            if (!user) {
                throw new Error("User not found.")
            }
            const newPass = await hashPassword({ password })
            user.password = newPass
            await user.save()
            await forgotPasswordSchema.findOneAndDelete({ token })
            return true
        } catch (err) {
            throw err
        }
    }

    static async logoutUserById({ id }) {
        try {
            const data = await accessTokenSchema.findOneAndDelete({ userId: id })
            return data
        } catch (err) {
            throw err
        }
    }

    static async getUserById({ id }) {
        try {
            const user = await User.findById(id)
            if (!user) {
                throw new Error("User not found.")
            }
            return { auth: true, user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt } }
        } catch (err) {
            throw err
        }
    }

    static async isAdmin({ userId }) {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found.")
            }
            return user.role === "admin"
        } catch (err) {
            throw err
        }
    }
}

module.exports = AuthService