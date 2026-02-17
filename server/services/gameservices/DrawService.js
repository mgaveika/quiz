const DrawAttempt = require('../../models/attempts/DrawAttempt')
const GameSession = require('../../models/sessions/Main')

class DrawService {
    static async createAttempt({ sessionId, players, extraData }) {
        const data = {
            session: sessionId,
            gameType: 'draw',
            rounds: extraData.rounds || 1,
            timePerRound: extraData.timePerRound || 60,
            results: players.map(p => {
                const isGuest = String(p.userId).startsWith('guest_')
                return {
                    [isGuest ? 'guest' : 'user']: p.userId,
                    username: p.username,
                    score: 0,
                    finished: false
                }
            }),
            drawings: [],
            ...extraData
        }
        return await DrawAttempt.create(data)
    }

    static async getRandomWords(count = 3) {
        const words = [
            "Apple", "Banana", "Cat", "Dog", "Elephant", "Fish", "Giraffe", "House", "Ice Cream", "Jellyfish",
            "Kite", "Lion", "Monkey", "Nest", "Owl", "Penguin", "Queen", "Rabbit", "Snake", "Tiger",
            "Umbrella", "Violin", "Whale", "Xylophone", "Yacht", "Zebra", "Airplane", "Ball", "Car", "Drum",
            "Egg", "Flower", "Guitar", "Hat", "Igloo", "Key", "Lamp", "Moon", "Nose", "Orange",
            "Pencil", "Robot", "Star", "Train", "Watch", "Pizza", "Burger", "Computer", "Phone", "Book"
        ];

        const shuffled = words.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    static async startGame({ session, settings, participants, GameAttemptService }) {
        session.gameData.settings = settings
        session.gameData.currentRound = 1
        session.gameData.roundStartTime = new Date()

        const firstPlayer = participants[0]
        const isGuest = String(firstPlayer.userId).startsWith('guest_')

        session.gameData.currentDrawer = {
            [isGuest ? 'guest' : 'user']: firstPlayer.userId,
            username: firstPlayer.username
        }

        const sharedAttempt = await GameAttemptService.createGameAttempt({
            sessionId: session._id,
            gameType: 'draw',
            players: participants,
            extraData: {
                rounds: settings.rounds,
                timePerRound: settings.timePerRound
            }
        })

        session.participants = participants.map(p => {
            const isGuest = String(p.userId).startsWith('guest_')
            return {
                [isGuest ? 'guest' : 'user']: p.userId,
                username: p.username,
                attemptId: sharedAttempt._id
            }
        })

        session.status = 'in-progress'
        session.gameData.wordChoices = await this.getRandomWords(3)
        await session.save()
        return session
    }

    static async getGameStatus({ session }) {
        const now = new Date()
        const startTime = session.gameData.roundStartTime
        const secondsElapsed = Math.floor((now - startTime) / 1000)

        const hasWord = !!session.gameData.currentWord
        const timeLimit = hasWord ? (session.gameData.settings.timePerRound || 60) : 10

        const timeLeft = Math.max(0, timeLimit - secondsElapsed)

        let results = []
        let attempt = null
        if (session.participants.length > 0 && session.participants[0].attemptId) {
            attempt = await DrawAttempt.findById(session.participants[0].attemptId)
            if (attempt) {
                results = attempt.results
            }
        }

        return {
            session: {
                status: session.status,
                currentRound: session.gameData.currentRound,
                currentDrawer: session.gameData.currentDrawer,
                currentWord: session.gameData.currentWord,
                timeRemaining: timeLeft,
                settings: session.gameData.settings
            },
            totalPlayers: session.participants.length,
            results: results,
            drawings: attempt ? attempt.drawings : []
        }
    }

    static async selectWord({ sessionId, word }) {
        const session = await GameSession.findById(sessionId)
        if (!session) {
            throw new Error("Session not found")
        }

        session.gameData.currentWord = word
        session.gameData.wordChoices = []
        session.gameData.roundStartTime = new Date()
        await session.save()
        return session
    }

    static async handleGuess({ sessionId, userId, username, text }) {
        const session = await GameSession.findById(sessionId)

        if (!session) {
            return { type: 'chat', text }
        }

        if (session.status !== 'in-progress') {
            return { type: 'chat', text }
        }

        const currentWord = session.gameData.currentWord
        if (!currentWord) {
            return { type: 'chat', text }
        }

        const wordLower = currentWord.toLowerCase()
        const guessLower = text.toLowerCase().trim()

        if (wordLower !== guessLower) {
            return { type: 'chat', text, user: username }
        }

        const drawerUserId = session.gameData.currentDrawer.user
        const drawerGuestId = session.gameData.currentDrawer.guest
        const isDrawer = (drawerUserId && String(drawerUserId) === String(userId)) || (drawerGuestId && drawerGuestId === userId)

        if (isDrawer) {
            return { type: 'system', text: "You cannot guess your own word!" }
        }

        const participants = session.participants
        let sharedAttempt = null

        if (participants.length > 0 && participants[0].attemptId) {
            sharedAttempt = await DrawAttempt.findById(participants[0].attemptId)
        }

        if (sharedAttempt) {
            const guesserIdx = sharedAttempt.results.findIndex(r => {
                const rId = r.user || r.guest
                return String(rId) === String(userId)
            })

            if (guesserIdx !== -1) {
                sharedAttempt.results[guesserIdx].score += 50
            }

            const drawerId = drawerUserId || drawerGuestId

            const drawerIdx = sharedAttempt.results.findIndex(r => {
                const rId = r.user || r.guest
                return String(rId) === String(drawerId)
            })

            if (drawerIdx !== -1) {
                sharedAttempt.results[drawerIdx].score += 100
            }

            await sharedAttempt.save()
        }

        return {
            type: 'success',
            text: `${username} guessed the word!`,
            user: "System",
            isCorrect: true,
            roundOver: true,
            winner: username,
            winnerId: userId,
            word: currentWord
        }
    }

    static async saveTurnDrawing({ sessionId, canvasData, winner }) {
        const session = await GameSession.findById(sessionId)
        if (!session || !session.participants.length) return

        const attempt = await DrawAttempt.findById(session.participants[0].attemptId)
        if (!attempt) return

        const currentWord = session.gameData.currentWord || "Unknown"
        const drawer = session.gameData.currentDrawer

        const turnData = {
            word: currentWord,
            drawer: drawer,
            canvasData: typeof canvasData === 'string' ? canvasData : JSON.stringify(canvasData),
            completed: true
        }

        if (winner) {
            const isGuest = String(winner.id).startsWith('guest_')
            turnData.firstGuesser = {
                [isGuest ? 'guest' : 'user']: winner.id,
                username: winner.username
            }
        }

        attempt.drawings.push(turnData)
        await attempt.save()
    }

    static async advanceTurn({ sessionId }) {
        const session = await GameSession.findById(sessionId)
        if (!session) {
            throw new Error("Session not found")
        }

        const allParticipants = session.participants
        const currentDrawerId = session.gameData.currentDrawer.user || session.gameData.currentDrawer.guest

        let currentPlayerIndex = -1
        for (let i = 0; i < allParticipants.length; i++) {
            const participantId = allParticipants[i].user || allParticipants[i].guest
            if (String(participantId) === String(currentDrawerId)) {
                currentPlayerIndex = i
                break
            }
        }

        const totalRoundsSetting = session.gameData.settings.rounds || 1
        const totalRequiredTurns = totalRoundsSetting * allParticipants.length
        const currentTurnNumber = session.gameData.currentRound

        if (currentTurnNumber >= totalRequiredTurns) {
            session.status = 'completed'
            await session.save()
            return session
        }

        let nextPlayerIndex = currentPlayerIndex + 1
        if (nextPlayerIndex >= allParticipants.length) {
            nextPlayerIndex = 0
        }

        session.gameData.currentRound = currentTurnNumber + 1

        const nextPlayer = allParticipants[nextPlayerIndex]
        const nextPlayerId = nextPlayer.user || nextPlayer.guest
        const isGuest = String(nextPlayerId).startsWith('guest_')

        session.gameData.currentDrawer = {
            [isGuest ? 'guest' : 'user']: nextPlayerId,
            username: nextPlayer.username
        }
        session.gameData.currentWord = null
        session.gameData.wordChoices = await this.getRandomWords(3)
        session.gameData.roundStartTime = new Date()

        await session.save()
        return session
    }
}

module.exports = DrawService
