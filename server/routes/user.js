const express = require('express')
const UserService = require('../services/UserService')

const router = express.Router()

router.post('/updatePassword', async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body
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

router.get('/:name', async (req, res) => {
    try {
        const {name} = req.params
        const data = await UserService.getUserByName({name})
        res.json({ data: data, message: `Recieved user with name: ${name}`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

router.delete('/deleteAccount', async (req, res) => {
    try {
        const data = await UserService.deleteAccount({id: req.userId})
        res.json({ data: data, message: "Account deleted successfully!", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message , status: "error" })
    }
})

module.exports = router