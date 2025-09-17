const express = require('express')
const RoomService = require('../services/RoomService')

const router = express.Router()

router.post('/create', async (req, res) => {
    try {
        const userId = req.userId
        const {quizId} = req.body
        const data = await RoomService.createRoom({quizId, userId})
        res.json({ data: data, message: "Room created", status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error" })
    }
})

router.get('/:code', async (req, res) => {
    try {
        const {code} = req.params
        const userId = req.userId
        const data = await RoomService.getRoomByCode({code})
        res.json({ data: {data, creator: userId === data.room.host.toString()}, message: `Room ${code} recieved`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error"  })
    }
})

router.get('/:code/session', async (req, res) => {
    try {
        const {code} = req.params
        const userId = req.userId
        const data = await RoomService.getSessionByCode({code, userId})
        res.json({ data: data, message: `Room ${code} session data recieved`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error"  })
    }
})

router.post('/:code/start', async (req, res) => {
    try {
        const {code} = req.params
        const userId = req.userId
        const {settings, participants} = req.body
        const data = await RoomService.startRoom({code, userId, settings, participants})
        res.json({ data: data, message: `Room ${code} started`, status: "success" })
    } catch (err) {
        res.json({ data: null, message: err.message, status: "error"  })
    }
})


module.exports = router
