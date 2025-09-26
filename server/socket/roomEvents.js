module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-room', async ({ code }) => {
            socket.join(code)
            let participantsMap = new Map();
            await io.in(code).fetchSockets().then((sockets) => {
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
            io.to(code).emit("user-joined", {participants: Array.from(participantsMap.values())})
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
                io.to(code).emit("user-left", {participants: Array.from(participantsMap.values())})
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
            io.to(code).emit("user-left", {participants: Array.from(participantsMap.values())})
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
