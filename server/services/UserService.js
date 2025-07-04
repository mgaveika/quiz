const bcrypt = require('bcrypt')
const User = require('../models/Users')

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

async function checkPassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

class AuthService {
    static async updatePassword({currentPassword, newPassword, confirmNewPassword, id}) {
        try {
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                throw new Error("All fields are required!")
            }
            if (newPassword != confirmNewPassword) {
                throw new Error("Passwords doesn't match.")
            }
            const user = await User.findById(id)
            if (!user) {
                throw new Error("User not found.")
            }
            const checkedPass = await checkPassword(currentPassword, user.password)
            if (!checkedPass) {
                throw new Error("Invalid password.")
            }
            user.password = await hashPassword(newPassword)
            user.updated_at = new Date()
            return await user.save()
        } catch (err) {
            throw err
        }
    }
    static async deleteAccount(id) {
        try {
            const user = await User.findById(id)
            if (!user) {
                throw new Error("User not found.")
            }
            return await User.deleteOne({ _id: id })
        } catch(err) {
            throw err
        }
    }
}

module.exports = AuthService