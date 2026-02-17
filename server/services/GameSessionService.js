const GameSessionSchema = require('../models/sessions/Main')
const GameAttemptService = require('./GameAttemptService')
const QuizService = require('./gameservices/QuizService')
const WordleService = require('./gameservices/WordleService')
const DrawService = require('./gameservices/DrawService')

class GameSessionService {
    static getGameService(gameType) {
        switch (gameType) {
            case 'wordle':
                return WordleService
            case 'quiz':
                return QuizService
            case 'draw':
                return DrawService
            default:
                throw new Error("Unknown game type")
        }
    }

    static async generateRoomCode() {
        try {
            let active = true
            let newCode
            while (active) {
                newCode = Math.floor(100000 + Math.random() * 900000)
                const existingCode = await GameSessionSchema.findOne({ roomCode: newCode })
                if (!existingCode) { active = false }
            }
            return newCode
        } catch (err) {
            throw err
        }
    }

    static async createGameSession({ userId, guest, gameType, gameData = {} }) {
        try {
            const roomCode = await this.generateRoomCode()
            const data = {
                roomCode,
                gameType,
                gameData: { ...gameData, gameType }
            }
            if (guest) {
                data.guestHost = userId
            } else {
                data.userHost = userId
            }
            const session = await GameSessionSchema.create(data)
            return session
        } catch (err) {
            throw err
        }
    }

    static async getGameSessionByCode({ roomCode }) {
        try {
            const gameSession = await GameSessionSchema.findOne({ roomCode })
                .populate('gameData.quizId')
                .populate('participants.attemptId')
            return gameSession
        } catch (err) {
            throw err
        }
    }

    static async startGame({ roomCode, settings, participants }) {
        try {
            const session = await this.getGameSessionByCode({ roomCode })
            if (!session) throw new Error("Game session not found")

            const service = this.getGameService(session.gameType)
            return await service.startGame({ session, settings, participants, GameAttemptService })
        } catch (err) {
            throw err
        }
    }

    static async deleteGameSession({ roomCode }) {
        try {
            await GameSessionSchema.deleteOne({ roomCode })
        } catch (err) {
            throw err
        }
    }

    static async getGameStatus({ roomCode }) {
        try {
            const session = await this.getGameSessionByCode({ roomCode })
            if (!session) throw new Error("Session not found")

            const service = this.getGameService(session.gameType)
            return await service.getGameStatus({ session })
        } catch (err) {
            throw err
        }
    }
}

module.exports = GameSessionService