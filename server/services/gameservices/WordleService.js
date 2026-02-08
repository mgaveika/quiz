const WordleAttempt = require('../../models/attempts/WordleAttempt')
const GameSession = require('../../models/sessions/Main')

class WordleService {
    static async createAttempt({ sessionId, players, extraData }) {
        const data = {
            session: sessionId,
            gameType: 'wordle',
            word: extraData.word,
            maxWordleAttempts: extraData.maxWordleAttempts || 6,
            results: players.map(p => {
                const isGuest = String(p.userId).startsWith('guest_')
                return {
                    [isGuest ? 'guest' : 'user']: p.userId,
                    username: p.username,
                    attempts: [],
                    finished: false
                }
            }),
            ...extraData
        }
        return await WordleAttempt.create(data)
    }

    static async updateAttempt({ userId, guest, attemptId, updateData }) {
        const userField = guest ? 'guest' : 'user'

        const query = {
            _id: attemptId,
            "results": { $elemMatch: { [userField]: userId } }
        }

        const update = { $set: {} }
        if (updateData.attempts) update.$set["results.$.attempts"] = updateData.attempts
        if (updateData.finished !== undefined) update.$set["results.$.finished"] = updateData.finished

        const attempt = await WordleAttempt.findOneAndUpdate(query, update, { new: true })
        if (!attempt) throw new Error("Participant not found in game")

        const allFinished = attempt.results.every(player => player.finished)
        if (allFinished) {
            await GameSession.findByIdAndUpdate(attempt.session, { status: 'completed' })
        }

        return { attempt, allFinished }
    }

    static async getAttempt({ userId, guest, sessionId }) {
        const query = sessionId
            ? { session: sessionId }
            : { "results": { $elemMatch: { [guest ? 'guest' : 'user']: userId } } }

        const attempt = await WordleAttempt.findOne(query).sort({ createdAt: -1 })

        if (attempt && attempt.results) {
            const isParticipant = attempt.results.some(p => String(p.user || p.guest) === String(userId))
            if (!isParticipant) return null
        }

        return attempt
    }

    static async getRandomWord({ length }) {
        try {
            const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}`)
            const data = await response.json()
            return data[0]
        } catch (err) {
            throw err
        }
    }

    static async startGame({ session, settings, participants, GameAttemptService }) {
        session.gameData.settings = { ...session.gameData.settings, ...settings }
        session.gameData.word = await this.getRandomWord({ length: session.gameData.settings.wordLength || 5 })

        const sharedAttempt = await GameAttemptService.createGameAttempt({
            sessionId: session._id,
            gameType: 'wordle',
            players: participants,
            extraData: {
                word: session.gameData.word,
                maxWordleAttempts: session.gameData.settings.wordleAttempts || 6
            }
        })

        const participantAttempts = []
        participants.forEach(p => {
            const isGuest = String(p.userId).startsWith('guest_')
            participantAttempts.push({
                [isGuest ? 'guest' : 'user']: p.userId,
                username: p.username,
                attemptId: sharedAttempt._id
            })
        })

        session.participants = participantAttempts
        session.status = 'in-progress'
        await session.save()
        return session
    }

    static async getGameStatus({ session }) {
        return {
            session: {
                status: session.status
            },
            totalPlayers: session.participants.length
        }
    }
}

module.exports = WordleService
