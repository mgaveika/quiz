const bcrypt = require('bcrypt')
const User = require('../models/Users')
const jwt = require('jsonwebtoken')

async function checkPassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

class AuthService {
  static async login({email, password}) {
    if (!email || !password) {
        return { msg: "Email and password are required.", msgType: "error" }
    }
    const user = await User.where("email").equals(email.toLowerCase())
    if (user.length > 0) {
        const checkedPass = await checkPassword(password, user[0].password)
        if (checkedPass) {
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' })
            return { auth: true, token: token, msg: "Login successful!", msgType: "success" }
        }
    }
    return { auth: false, msg: "Invalid email or password.", msgType: "error" }
  }

  static async register({email, username, password, confirmPassword}) {
    if (!email || !username || !password) {
        return { msg: "All fields are required.", msgType: "error"  }
    }
    if (password.length < 8) {
        return { msg: "Password must be at least 8 characters long.", msgType: "error"  }
    }
    if (password !== confirmPassword) {
        return { msg: "Passwords do not match.", msgType: "error"  }
    }
    const checkEmail = await User.where("email").equals(email.toLowerCase())
    if (checkEmail.length > 0) {
        return { msg: "This email is already registered.", msgType: "error"  }
    }
    const checkUsername = await User.where("username").equals(username)
    if (checkUsername.length > 0) {
        return { msg: "User with this name already exists.", msgType: "error"  }
    }
    const hashedPassword = await hashPassword(password)
    const newUser = await User.create({
        email: email.toLowerCase(),
        username: username,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
    })
    return { msg: "User successfully registered", msgType: "success" }
  }

  static async isAuth({id}) {
    const user = await User.findById(id)
    if (!user) {
        return { auth: false, msg: "User not found.", msgType: "error" }
    }
    return { auth: true, user: { id: user.id, email: user.email, username: user.username, created_at: user.created_at }, msgType: "success" }
  }
}

module.exports = AuthService