const Room = require("../models/Room")
const Users = require("../models/Users")
const GameSession = require("../models/GameSession")
const Quiz = require("../models/Quiz")
const QuizQuestion = require("../models/QuizQuestion")

class RoomService {
    static async generateRoomCode() {
        try {
            let active = true
            let newCode
            while (active) {
                newCode = Math.floor(100000 + Math.random() * 900000)
                const existingCode = await Room.findOne({code: newCode})
                if (!existingCode) {
                    active = false
                }
            }
            return newCode
        } catch (err) {
            throw err
        }
    }

    static async createRoom({quizId, userId}) {
        try {
            const newCode = await this.generateRoomCode()
            const room = await Room.create(
                {
                    code: newCode, 
                    host: userId, 
                    quizId
                })
            return room
        } catch (err) {
            throw err
        }
    }

    static async getRoomByCode({code}) {
        try {
            if (typeof code !== 'number' || !Number.isFinite(code)) {
                throw new Error("Room not found")
            }
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }
            const session = await GameSession.findOne({room})
            const hostUsername = await Users.findById(room.host)
            return {room, hostUsername: hostUsername.username, active: session ? true : false}
        } catch (err) {
            throw err
        }
    }

    static async startRoom({code, userId, settings, participants}) {
        try {
            const room = await Room.findOne({code})
            if (!room) {
                throw Error("Room not found")
            }
            if (room.host.toString() !== userId) {
                throw Error("Access denied")
            }
            const session = await GameSession.create({
                room,
                settings,
                participants,
                startedAt: new Date()
            })
            if (!session) {
                throw Error("Failed creating game session")
            }
            return session
        } catch (err) {
            throw err
        }
    }

    static async getSessionByCode({code, userId}) {
        try {
            if (typeof code !== 'number' || !Number.isFinite(code)) {
                throw new Error("Room not found")
            }
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }
            const session = await GameSession.findOne({room})
            if (!session) {
                throw new Error("Game session not found")
            }
            const isParticipant = session.participants.some(p => String(p.user) === String(userId))
            if (!isParticipant) {
                throw new Error("Access denied")
            }
            const quiz = await Quiz.findById(room.quizId)
            if (!quiz) {
                throw new Error("Quiz not found")
            }
            const quizQuestions = await QuizQuestion.find(room.quizId)
            if (!quizQuestions) {
                throw new Error("Quiz questions not found")
            }
            return {session, host: room.host, creator: userId === room.host.toString(), quiz, quizQuestions}
        } catch (err) {
            throw err
        }
    }
}

module.exports = RoomService