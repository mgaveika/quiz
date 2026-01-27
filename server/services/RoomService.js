const Room = require("../models/Room")
const Users = require("../models/Users")
const GameSession = require("../models/GameSession")
const Quiz = require("../models/Quiz")
const QuizQuestion = require("../models/QuizQuestion")
const QuizAttemptService = require("./QuizAttemptService")

class RoomService {
    static async generateRoomCode() {
        try {
            let active = true
            let newCode
            while (active) {
                newCode = Math.floor(100000 + Math.random() * 900000)
                const existingCode = await Room.findOne({ code: newCode })
                if (!existingCode) {
                    active = false
                }
            }
            return newCode
        } catch (err) {
            throw err
        }
    }

    static async createRoom({ quizId, userId, guest }) {
        try {
            const newCode = await this.generateRoomCode()
            const data = {
                code: newCode,
                quizId
            }

            if (guest) {
                data.guest = userId
            } else {
                data.host = userId
            }

            const room = await Room.create(data)
            return room
        } catch (err) {
            throw err
        }
    }

    static async getRoomByCode({ code }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }
            const session = await GameSession.findOne({ room })
            if (room.host) {
                const hostUsername = await Users.findById(room.host)
                return { room, hostUsername: hostUsername.username, active: session ? true : false }
            }
            return { room, hostUsername: room.guest, active: session ? true : false }
        } catch (err) {
            throw err
        }
    }

    static async submitAnswer({ code, userId, guest, questionIndex, selectedAnswers, timeUsed }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }

            const session = await GameSession.findOne({ room })
            if (!session) {
                throw new Error("Game session not found")
            }
            const userField = guest ? 'guest' : 'user'
            const participantIndex = session.participants.findIndex(p => String(p[userField]) === String(userId))
            if (participantIndex === -1) {
                throw new Error("Access denied")
            }

            if (questionIndex !== session.currentQuestion) {
                throw new Error("Question mismatch")
            }

            const quizQuestions = await QuizQuestion.find({ quizId: room.quizId }).sort({ order: 1 })
            const currentQuestionData = quizQuestions[questionIndex]

            if (!currentQuestionData) {
                throw new Error("Question not found")
            }

            // Check if already answered
            const existingAnswer = session.participants[participantIndex].answersHistory.find(ah =>
                ah.questionId && ah.questionId.toString() === currentQuestionData._id.toString()
            )

            if (existingAnswer) {
                throw new Error("Already answered this question")
            }

            // Create or find quiz attempt
            const QuizAttempt = require("../models/QuizAttempt")
            const attemptUserField = guest ? 'guest' : 'user'

            var attempt = await QuizAttempt.findOne({
                quizId: room.quizId,
                [attemptUserField]: userId
            }).sort({ createdAt: -1 })

            if (!attempt) {
                attempt = await QuizAttemptService.createQuizAttempt({
                    quizId: room.quizId,
                    userId,
                    guest
                })
            }

            // Update quiz attempt
            await QuizAttemptService.updateQuizAttempt({
                attemptId: attempt._id,
                questionId: currentQuestionData._id,
                answer: selectedAnswers
            })

            // Calculate if answer is correct and points
            var isCorrect = false
            var points = 0

            if (currentQuestionData.answerType === "single") {
                const selectedOption = currentQuestionData.options[selectedAnswers[0]]
                isCorrect = selectedOption && selectedOption.correctAnswer
            } else if (currentQuestionData.answerType === "multi") {
                const correctIndices = currentQuestionData.options
                    .map((opt, idx) => opt.correctAnswer ? idx : null)
                    .filter(idx => idx !== null)

                isCorrect = correctIndices.length === selectedAnswers.length &&
                    correctIndices.every(idx => selectedAnswers.includes(idx)) &&
                    selectedAnswers.every(idx => correctIndices.includes(idx))
            }

            if (isCorrect) {
                const maxTime = session.settings.timePerQuestion || 30
                const timeBonus = Math.max(0, (maxTime - timeUsed) / maxTime)
                points = Math.round(1000 * (0.5 + 0.5 * timeBonus))
            }

            // Update session with answer
            session.participants[participantIndex].answersHistory.push({
                questionId: currentQuestionData._id,
                answer: JSON.stringify(selectedAnswers),
                correct: isCorrect,
                timeTaken: timeUsed
            })

            session.participants[participantIndex].score += points
            await session.save()

            // Count how many players have answered this question
            const playersAnswered = session.participants.filter(p => {
                return p.answersHistory.some(ah =>
                    ah.questionId && ah.questionId.toString() === currentQuestionData._id.toString()
                )
            }).length
            if (playersAnswered === session.participants.length) {
                setTimeout(async () => {
                    try {
                        if (session.currentQuestion >= quizQuestions.length - 1) {
                            await GameSession.findByIdAndUpdate(session._id, {
                                status: "completed",
                                endedAt: new Date()
                            })
                            setTimeout(async () => {
                                await RoomService.cleanupRoom({ code })
                            }, 30000)
                        } else {
                            await GameSession.findByIdAndUpdate(session._id, {
                                currentQuestion: session.currentQuestion + 1,
                                questionStartTime: new Date()
                            })
                        }
                    } catch (error) {
                        console.error('Error:', error)
                    }
                }, 1000)
            }

            return {
                correct: isCorrect,
                points: points,
                playersAnswered: playersAnswered,
                totalPlayers: session.participants.length
            }
        } catch (err) {
            throw err
        }
    }

    static async getSessionStatus({ code, userId, guest }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }

            const session = await GameSession.findOne({ room })
            if (!session) {
                throw new Error("Game session not found")
            }

            const userField = guest ? 'guest' : 'user'
            const isParticipant = session.participants.some(p => String(p[userField]) === String(userId))
            if (!isParticipant) {
                throw new Error("Access denied")
            }

            const quizQuestions = await QuizQuestion.find({ quizId: room.quizId }).sort({ order: 1 })
            const currentQuestionData = quizQuestions[session.currentQuestion]

            if (!currentQuestionData) {
                return {
                    session: {
                        currentQuestion: session.currentQuestion,
                        status: "completed",
                        timePerQuestion: session.settings.timePerQuestion,
                        remainingTime: 0
                    },
                    playersAnswered: session.participants.length,
                    totalPlayers: session.participants.length
                }
            }

            // Calculate remaining time
            const timePerQuestion = session.settings.timePerQuestion || 30
            const questionStartTime = session.questionStartTime || session.startedAt
            const elapsedTime = Math.floor((Date.now() - new Date(questionStartTime).getTime()) / 1000)
            const remainingTime = Math.max(0, timePerQuestion - elapsedTime)

            const playersAnswered = session.participants.filter(p => {
                return p.answersHistory.some(ah =>
                    ah.questionId && ah.questionId.toString() === currentQuestionData._id.toString()
                )
            }).length

            return {
                session: {
                    currentQuestion: session.currentQuestion,
                    status: session.status,
                    timePerQuestion: session.settings.timePerQuestion,
                    remainingTime: remainingTime
                },
                playersAnswered,
                totalPlayers: session.participants.length
            }
        } catch (err) {
            throw err
        }
    }

    static async startRoom({ code, userId, guest, settings, participants }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw Error("Room not found")
            }

            const userField = guest ? 'guest' : 'host'

            if (!room[userField] || room[userField].toString() !== userId) {
                throw Error("Access denied")
            }

            const newParticipantsArray = participants.map(({ user }) => {
                const id = String(user);
                return id.includes('guest_')
                    ? { guest: id }
                    : { user: id };
            });

            const session = await GameSession.create({
                room,
                settings,
                participants: newParticipantsArray,
                startedAt: new Date(),
                questionStartTime: new Date()
            })
            if (!session) {
                throw Error("Failed creating game session")
            }
            return session
        } catch (err) {
            throw err
        }
    }

    static async cleanupRoom({ code }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                return
            }

            await Room.findByIdAndDelete(room._id)
            await GameSession.findOneAndDelete({ room: room._id })

        } catch (err) {
            console.error('Error cleaning up room:', err)
        }
    }

    static async getSessionByCode({ code, userId, guest }) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }
            const session = await GameSession.findOne({ room })
            if (!session) {
                throw new Error("Game session not found")
            }
            const userField = guest ? 'guest' : 'user'
            const isParticipant = session.participants.some(p => String(p[userField]) === String(userId))
            if (!isParticipant) {
                throw new Error("Access denied")
            }
            const quiz = await Quiz.findById(room.quizId)
            const quizQuestions = await QuizQuestion.find({ quizId: room.quizId }).sort({ order: 1 })

            // Include userId in session data for client-side checks
            const sessionWithUserId = {
                ...session.toObject(),
                userId: userId
            }

            const isCreator = (room.host && userId === room.host.toString()) ||
                (room.guest && userId === room.guest)

            return {
                session: sessionWithUserId,
                host: room.host,
                creator: isCreator,
                quiz,
                quizQuestions,
                userId: userId
            }
        } catch (err) {
            throw err
        }
    }
    static async cleanupInactiveRooms() {
        try {
            const timeAgo = new Date(Date.now() - 60 * 60 * 1000) // 1h

            const oldSessions = await GameSession.find({
                updatedAt: { $lt: timeAgo },
                status: 'in-progress'
            }).populate('room')

            for (const session of oldSessions) {
                if (session.room) {
                    console.log(`Old session cleanup - ${session.room.code}`)
                    await Room.findByIdAndDelete(session.room._id)
                }
                await session.remove()
            }

            const oldRooms = await Room.find({ createdAt: { $lt: timeAgo } })
            for (const room of oldRooms) {
                const session = await GameSession.findOne({ room: room._id })
                if (!session) {
                    console.log(`Old room cleanup - ${room.code}`)
                    await Room.findByIdAndDelete(room._id)
                }
            }
        } catch (err) {
            console.error('Error in cleanupInactiveRooms:', err)
        }
    }
}

module.exports = RoomService