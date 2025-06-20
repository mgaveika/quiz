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
        res.json(data)
    } catch (err) {
        console.log(err)
        res.json({ msg: err.message , msgType: "error" })
    }
})

module.exports = router