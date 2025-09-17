const bcrypt = require("bcrypt")
const User = require("../models/Users")
const jwt = require("jsonwebtoken")
const accessTokenSchema = require("../models/AccessTokens")
const moment = require("moment")

async function checkPassword({password, hashedPassword}) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

async function hashPassword({password}) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

class AuthService {
    static async createToken({userId, username}) {
        await accessTokenSchema.deleteMany({userId: userId})
        const newToken = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET)
        let today = moment()
        today.add(7, "days")
        await accessTokenSchema.create({userId: userId, token: newToken, expireDate: today})
        return newToken
    }
    static async login({email, password}) {
        try {
            if (!email || !password) {
                throw new Error("Email and password are required.")
            }
            const user = await User.where("email").equals(email.toLowerCase())
            if (user.length > 0) {
                const checkedPass = await checkPassword({password, hashedPassword: user[0].password})
                if (checkedPass) {
                    const existingAccessToken = await accessTokenSchema.findOne({userId: user[0].id})
                    if (existingAccessToken) {
                        return { token: existingAccessToken.token }
                    }
                    const token = await this.createToken({userId: user[0].id, username: user[0].username})
                    return { token: token }
                }
            }
            throw new Error("Invalid email or password.")
        } catch(err) {
            throw err
        }
    }

    static async register({email, username, password, confirmPassword}) {
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
            const hashedPassword = await hashPassword({password})
            const newUser = await User.create({
                email: email.toLowerCase(),
                username: username,
                password: hashedPassword
            })
            return newUser
        } catch(err) {
            throw err
        }
    }

    static async logoutUserById({id}) {
        try {
            const data = await accessTokenSchema.findOneAndDelete({userId: id})
            return data
        } catch (err) {
            throw err
        }
    }

    static async getUserById({id}) {
        try {
            const user = await User.findById(id)
        if (!user) {
            throw new Error("User not found.")
        }
        return { auth: true, user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt }}
        } catch(err) {
            throw err
        }
    }
}

module.exports = AuthService