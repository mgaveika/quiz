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
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return { msg: "All fields are required!", msgType: "error" }
        }
        if (newPassword != confirmNewPassword) {
            return { msg: "Password doesn't match.", msgType: "error" }
        }
        const user = await User.findById(id)
        if (!user) {
            return { msg: "User not found.", msgType: "error" }
        }
        const checkedPass = await checkPassword(currentPassword, user.password)
        if (!checkedPass) {
            return { msg: "Invalid user's password.", msgType: "error" }
        }
        user.password = await hashPassword(currentPassword)
        user.updated_at = new Date()
        await user.save()
        return {msg: "Password updated successfully!", msgType: "success"}
    }
    static async deleteAccount(id) {
        const user = await User.findById(id)
        if (!user) {
            return { msg: "User not found.", msgType: "error" }
        }
        await User.deleteOne({ _id: id })
        return { msg: "Account deleted successfully!", msgType: "success" }
    }
}

module.exports = AuthService