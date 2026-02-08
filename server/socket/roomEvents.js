module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-room', async ({ code }) => {
            const roomCode = String(code)
            socket.join(roomCode)
            let participantsMap = new Map()
            await io.in(roomCode).fetchSockets().then((sockets) => {
                sockets.forEach((socket) => {
                    if (socket.request.userId) {
                        participantsMap.set(socket.request.userId, {
                            username: socket.request.username,
                            userId: socket.request.userId
                        })
                    }
                })
            }).catch((err) => {
                console.error('Error fetching sockets:', err)
            })
            io.to(roomCode).emit("user-joined", { participants: Array.from(participantsMap.values()) })
        })

        socket.on('leave-room', async ({ code }) => {
            socket.leave(code)
            let participantsMap = new Map()
            await io.in(code).fetchSockets().then((sockets) => {
                sockets.forEach((s) => {
                    if (s.request.userId) {
                        participantsMap.set(s.request.userId, {
                            username: s.request.username,
                            userId: s.request.userId
                        })
                    }
                })
            }).catch((err) => {
                console.error('Error fetching sockets:', err)
            })
            io.to(code).emit("user-left", { participants: Array.from(participantsMap.values()) })
        })

        socket.on('remove-participant', async ({ code, username }) => {
            await io.in(code).fetchSockets().then((sockets) => {
                sockets.forEach((s) => {
                    if (s.request.username === username) {
                        s.emit("removed-from-room", { code })
                        s.leave(code)
                        s.disconnect(true)
                    }
                })
            }).catch((err) => {
                console.error('Error removing participant:', err)
            })
            let participantsMap = new Map()
            await io.in(code).fetchSockets().then((sockets) => {
                sockets.forEach((s) => {
                    if (s.request.userId) {
                        participantsMap.set(s.request.userId, {
                            username: s.request.username,
                            userId: s.request.userId
                        })
                    }
                })
            }).catch((err) => {
                console.error('Error fetching sockets:', err)
            })
            io.to(code).emit("user-left", { participants: Array.from(participantsMap.values()) })
        })

        socket.on('start-game', ({ code }) => {
            io.to(code).emit("start-game")
        })
        socket.on('delete-room', ({ code }) => {
            io.to(code).emit("room-deleted")
        })
        socket.on('update-settings', ({ code, settings }) => {
            socket.to(code).emit("settings-updated", { settings })
        })

        socket.on('game-progress', ({ code, userId, username, progress }) => {
            socket.to(code).emit('game-progress', { userId, username, progress })
        })

        socket.on('disconnect', () => {
            // Loop through all rooms except socket.id
            const rooms = Array.from(socket.rooms).filter(room => room !== socket.id)
            rooms.forEach(async (code) => {
                socket.leave(code)
                let participantsMap = new Map()
                await io.in(code).fetchSockets().then((sockets) => {
                    sockets.forEach((s) => {
                        if (s.request.userId) {
                            participantsMap.set(s.request.userId, {
                                username: s.request.username,
                                userId: s.request.userId
                            })
                        }
                    })
                }).catch((err) => {
                    console.error('Error fetching sockets:', err)
                })
                io.to(code).emit("user-left", { participants: Array.from(participantsMap.values()) })
            })
        })
    })
}
