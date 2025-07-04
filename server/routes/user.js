const express = require('express')
const UserService = require('../services/UserService')

const router = express.Router()

router.post('/updatePassword', async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body
    try {
        const id = req.userId
        const data = await UserService.updatePassword({
            currentPassword, 
            newPassword, 
            confirmNewPassword,
            id
        })
        res.json({ data: data, message: "Password updated successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/deleteAccount', async (req, res) => {
    try {
        const data = await UserService.deleteAccount(req.userId)
        res.json({ data: data, message: "Account deleted successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router