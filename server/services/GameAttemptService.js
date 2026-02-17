const mongoose = require('mongoose')
const GameAttempt = require('../models/attempts/Main')
const WordleService = require('./gameservices/WordleService')
const QuizService = require('./gameservices/QuizService')
const DrawService = require('./gameservices/DrawService')


class GameAttemptService {
    static getService(gameType) {
        switch (gameType) {
            case 'wordle':
                return WordleService
            case 'quiz':
                return QuizService
            case 'draw':
                return DrawService

        }
    }

    static async createGameAttempt({ userId, guest, sessionId, gameType, extraData = {}, players = [] }) {
        try {
            const service = this.getService(gameType)
            if (gameType === 'wordle' || gameType === 'draw') {
                return await service.createAttempt({ sessionId, players, extraData })
            }

            return await service.createAttempt({ userId, guest, sessionId, extraData })
        } catch (err) {
            throw err
        }
    }

    static async updateGameAttempt({ userId, guest, attemptId, updateData }) {
        try {
            const attempt = await GameAttempt.findById(attemptId)
            if (!attempt) throw new Error("Attempt not found")

            const service = this.getService(attempt.gameType)
            return await service.updateAttempt({ userId, guest, attemptId, updateData, io: updateData.io })
        } catch (err) {
            throw err
        }
    }

    static async getGameAttempt({ userId, guest, sessionId }) {
        try {
            let query = {}
            if (sessionId) {
                query = { session: sessionId }
            } else {
                const userField = guest ? 'guest' : 'user'
                query = { [userField]: userId }
            }

            const attempt = await GameAttempt.findOne(query).sort({ createdAt: -1 })
            if (!attempt) return null

            const service = this.getService(attempt.gameType)
            return await service.getAttempt({ userId, guest, sessionId })
        } catch (err) {
            throw err
        }
    }

    static async getAttemptById(id) {
        const attempt = await GameAttempt.findById(id)
        if (!attempt) return null

        if (attempt.gameType === 'quiz') {
            return await QuizService.getQuizResult(id)
        }

        return attempt
    }
}

module.exports = GameAttemptService
