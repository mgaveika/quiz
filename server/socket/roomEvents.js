const DrawService = require('../services/gameservices/DrawService')
const GameSession = require('../models/sessions/Main')

// We keep track of timers and canvas data in memory
const roomTimers = new Map()
const roomCanvasData = new Map()

module.exports = (io) => {

    // --- Helper Functions ---

    // Helper to get all players currently in a room
    async function getRoomParticipants(roomCode) {
        const sockets = await io.in(roomCode).fetchSockets()
        const participants = []

        for (const s of sockets) {
            if (s.request.userId) {
                participants.push({
                    username: s.request.username,
                    userId: s.request.userId
                })
            }
        }
        return participants
    }

    // Helper to move the game to the next player's turn
    async function moveToNextTurn(roomCode, winner = null) {
        try {
            // Clear any existing intervals/timers
            if (roomTimers.has(roomCode)) {
                clearInterval(roomTimers.get(roomCode))
                roomTimers.delete(roomCode)
            }

            const session = await GameSession.findOne({ roomCode: roomCode })
            if (!session || session.status !== 'in-progress') return

            const prevWord = session.gameData.currentWord
            const canvasData = roomCanvasData.get(String(roomCode)) || []

            // Save the drawing from the turn that just ended
            await DrawService.saveTurnDrawing({
                sessionId: session._id,
                canvasData: canvasData,
                winner: winner
            })

            const updatedSession = await DrawService.advanceTurn({ sessionId: session._id })

            // Send immediate status update
            const status = await DrawService.getGameStatus({ session: updatedSession })
            io.to(String(roomCode)).emit('draw-status-update', status)

            roomCanvasData.delete(String(roomCode))

            // If there was a word being drawn, announce it
            if (prevWord) {
                io.to(String(roomCode)).emit('new-guess', {
                    user: 'System',
                    text: `Time's up! The word was "${prevWord}". No one guessed it!`,
                    type: 'system'
                })
            }

            if (updatedSession.status === 'completed') {
                const finalStatus = await DrawService.getGameStatus({ session: updatedSession })
                const attemptId = updatedSession.participants[0]?.attemptId

                io.to(String(roomCode)).emit('game-finished', {
                    results: finalStatus.results,
                    drawings: finalStatus.drawings,
                    session: updatedSession,
                    attemptId: attemptId
                })

                // Delete the session after a small delay to ensure cleanup
                setTimeout(async () => {
                    await GameSession.deleteOne({ _id: updatedSession._id })
                    console.log(`Session ${roomCode} deleted as game is completed.`)
                }, 5000)
            } else {
                const drawerName = updatedSession.gameData.currentDrawer.username
                io.to(String(roomCode)).emit('new-guess', {
                    user: 'System',
                    text: `Turn for ${drawerName} begins!`,
                    type: 'system'
                })
            }

            await startRoundTimer(roomCode)
        } catch (err) {
            console.error('Error advancing turn:', err)
        }
    }

    async function startRoundTimer(roomCode) {
        if (roomTimers.has(roomCode)) {
            clearInterval(roomTimers.get(roomCode))
        }

        const interval = setInterval(async () => {
            const session = await GameSession.findOne({ roomCode: roomCode })
            if (!session || session.status !== 'in-progress') {
                clearInterval(interval)
                roomTimers.delete(roomCode)
                return
            }

            const status = await DrawService.getGameStatus({ session })

            if (status.session.timeRemaining <= 0) {
                if (!session.gameData.currentWord) {
                    let autoWord = ""
                    const choices = session.gameData.wordChoices || []

                    if (choices.length > 0) {
                        autoWord = choices[Math.floor(Math.random() * choices.length)]
                    } else {
                        const randomWords = await DrawService.getRandomWords(1)
                        autoWord = randomWords[0]
                    }

                    const updated = await DrawService.selectWord({ sessionId: session._id, word: autoWord })

                    const newStatus = await DrawService.getGameStatus({ session: updated })
                    io.to(roomCode).emit('draw-status-update', newStatus)

                    io.to(roomCode).emit('new-guess', {
                        user: 'System',
                        text: `${updated.gameData.currentDrawer.username} was too slow! Word selected: ${autoWord}`,
                        type: 'system'
                    })
                } else {
                    clearInterval(interval)
                    roomTimers.delete(roomCode)
                    await moveToNextTurn(roomCode)
                }
            } else {
                io.to(roomCode).emit('draw-status-update', status)
            }
        }, 1000)

        roomTimers.set(roomCode, interval)
    }


    io.on('connection', (socket) => {

        socket.on('join-room', async ({ code }) => {
            const roomCode = String(code)
            socket.join(roomCode)

            const participants = await getRoomParticipants(roomCode)
            io.to(roomCode).emit("user-joined", { participants })

            if (roomCanvasData.has(roomCode)) {
                const canvasData = roomCanvasData.get(roomCode)
                socket.emit('canvas-initial-load', canvasData)
            }
        })

        socket.on('leave-room', async ({ code }) => {
            const roomCode = String(code)
            socket.leave(roomCode)

            const participants = await getRoomParticipants(roomCode)
            io.to(roomCode).emit("user-left", { participants })
        })

        socket.on('remove-participant', async ({ code, username }) => {
            const roomCode = String(code)
            const sockets = await io.in(roomCode).fetchSockets()

            for (const s of sockets) {
                if (s.request.username === username) {
                    s.emit("removed-from-room", { code: roomCode })
                    s.leave(roomCode)
                    s.disconnect(true)
                }
            }

            const participants = await getRoomParticipants(roomCode)
            io.to(roomCode).emit("user-left", { participants })
        })

        socket.on('start-game', async ({ code, settings }) => {
            const roomCode = String(code)
            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session) return

                const participants = await getRoomParticipants(roomCode)

                if (session.gameType === 'draw') {
                    let updatedSession = session
                    if (session.status !== 'in-progress') {
                        const gameSettings = settings || session.gameData?.settings || {
                            rounds: 2,
                            timePerRound: 60
                        }
                        const GameAttemptService = require('../services/GameAttemptService')
                        updatedSession = await DrawService.startGame({
                            session,
                            settings: gameSettings,
                            participants,
                            GameAttemptService
                        })
                    }

                    const status = await DrawService.getGameStatus({ session: updatedSession })
                    io.to(roomCode).emit('draw-status-update', status)
                    io.to(roomCode).emit("start-game")

                    await startRoundTimer(roomCode)
                } else {
                    io.to(roomCode).emit("start-game")
                }
            } catch (err) {
                console.error("Error starting game:", err)
            }
        })

        socket.on('delete-room', ({ code }) => {
            const roomCode = String(code)
            io.to(roomCode).emit("room-deleted")
            roomCanvasData.delete(roomCode)
            if (roomTimers.has(roomCode)) {
                clearInterval(roomTimers.get(roomCode))
                roomTimers.delete(roomCode)
            }
        })

        socket.on('update-settings', ({ code, settings }) => {
            socket.to(String(code)).emit("settings-updated", { settings })
        })
        socket.on('draw-select-word', async ({ code, word }) => {
            const roomCode = String(code)
            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session) return

                const updatedSession = await DrawService.selectWord({ sessionId: session._id, word })

                const status = await DrawService.getGameStatus({ session: updatedSession })
                io.to(roomCode).emit('draw-status-update', status)
                io.to(roomCode).emit('new-guess', {
                    user: 'System',
                    text: 'A new word has been selected!',
                    type: 'system'
                })

                await startRoundTimer(roomCode)
            } catch (err) {
                console.error('Error selecting word:', err)
            }
        })

        socket.on('draw-message', async ({ code, text, userId, username }) => {
            const roomCode = String(code)
            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session) return

                const result = await DrawService.handleGuess({
                    sessionId: session._id,
                    userId: userId,
                    username: username,
                    text: text
                })

                if (result.isCorrect) {
                    io.to(roomCode).emit('new-guess', {
                        user: 'System',
                        text: result.text,
                        type: 'success'
                    })

                    io.to(roomCode).emit('round-winner', {
                        winner: result.winner,
                        word: result.word
                    })

                    if (roomTimers.has(roomCode)) {
                        clearInterval(roomTimers.get(roomCode))
                    }
                    setTimeout(async () => {
                        await moveToNextTurn(roomCode, { id: userId, username: username })
                    }, 1000)

                } else {
                    io.to(roomCode).emit('new-guess', {
                        user: username,
                        text: result.text,
                        type: result.type // 'chat' or 'guess'
                    })
                }
            } catch (err) {
                console.error('Error handling draw message:', err)
            }
        })

        socket.on('draw-data', async ({ code, paths }) => {
            const roomCode = String(code)

            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session || !session.gameData || !session.gameData.currentDrawer) {
                    return
                }

                const currentDrawerId = session.gameData.currentDrawer.user || session.gameData.currentDrawer.guest
                const senderId = socket.request.userId

                if (String(senderId) === String(currentDrawerId)) {
                    roomCanvasData.set(roomCode, paths)
                    socket.to(roomCode).emit('draw-data', paths)
                }
            } catch (err) {
                console.error('Error in draw-data:', err)
            }
        })

        socket.on('draw-stroke', async ({ code, stroke }) => {
            const roomCode = String(code)
            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session || !session.gameData || !session.gameData.currentDrawer) {
                    return
                }

                const currentDrawerId = session.gameData.currentDrawer.user || session.gameData.currentDrawer.guest
                const senderId = socket.request.userId

                if (String(senderId) === String(currentDrawerId)) {
                    if (!roomCanvasData.has(roomCode)) {
                        roomCanvasData.set(roomCode, [])
                    }
                    const currentData = roomCanvasData.get(roomCode)
                    if (Array.isArray(currentData)) {
                        currentData.push(stroke)
                    } else {
                        roomCanvasData.set(roomCode, [stroke])
                    }

                    socket.to(roomCode).emit('draw-stroke', stroke)
                }
            } catch (err) {
                console.error('Error in draw-stroke:', err)
            }
        })

        socket.on('canvas-clear', async ({ code }) => {
            const roomCode = String(code)

            try {
                const session = await GameSession.findOne({ roomCode: roomCode })
                if (!session || !session.gameData || !session.gameData.currentDrawer) {
                    return
                }

                const currentDrawerId = session.gameData.currentDrawer.user || session.gameData.currentDrawer.guest
                const senderId = socket.request.userId

                if (String(senderId) === String(currentDrawerId)) {
                    roomCanvasData.delete(roomCode)
                    socket.to(roomCode).emit('canvas-clear')
                }
            } catch (err) {
                console.error('Error in canvas-clear:', err)
            }
        })

        socket.on('disconnect', async () => {
            const allRooms = Array.from(socket.rooms)
            const roomCodes = allRooms.filter(room => room !== socket.id)

            for (const code of roomCodes) {
                socket.leave(code)
                const participants = await getRoomParticipants(code)
                io.to(code).emit("user-left", { participants })
            }
        })
    })
}
