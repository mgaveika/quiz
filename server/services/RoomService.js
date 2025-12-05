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

    static async submitAnswer({code, userId, questionIndex, selectedAnswers, timeUsed}) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                throw new Error("Room not found")
            }
            
            const session = await GameSession.findOne({room})
            if (!session) {
                throw new Error("Game session not found")
            }
            
            const participantIndex = session.participants.findIndex(p => String(p.user) === String(userId))
            if (participantIndex === -1) {
                throw new Error("Access denied")
            }
            
            if (questionIndex !== session.currentQuestion) {
                throw new Error("Question mismatch")
            }
            
            const quizQuestions = await QuizQuestion.find({quizId: room.quizId}).sort({order: 1})
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
            let attempt = await QuizAttempt.findOne({
                quizId: room.quizId,
                user: userId
            }).sort({ createdAt: -1 })
            
            // If no recent attempt, create new one
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
            if (!attempt || attempt.createdAt < tenMinutesAgo) {
                attempt = await QuizAttemptService.createQuizAttempt({
                    quizId: room.quizId, 
                    userId: userId
                })
            }
            
            // Update quiz attempt
            await QuizAttemptService.updateQuizAttempt({
                attemptId: attempt._id,
                questionId: currentQuestionData._id,
                answer: selectedAnswers
            })
            
            // Calculate if answer is correct and points
            let isCorrect = false
            let points = 0
            
            if (currentQuestionData.answerType === "single") {
                const selectedOption = currentQuestionData.options[selectedAnswers[0]]
                isCorrect = selectedOption && selectedOption.correctAnswer
            } else if (currentQuestionData.answerType === "multi") {
                const correctIndices = currentQuestionData.options
                    .map((opt, idx) => opt.correctAnswer ? idx : null)
                    .filter(idx => idx !== null)
                
                isCorrect = correctIndices.length === selectedAnswers.length &&
                    correctIndices.every(idx => selectedAnswers.includes(idx))
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
                                await this.cleanupRoom({code})
                            }, 30000)
                        } else {
                            await GameSession.findByIdAndUpdate(session._id, {
                                currentQuestion: session.currentQuestion + 1,
                                questionStartTime: new Date()
                            })                        }
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

    static async getSessionStatus({code, userId}) {
        try {
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
            
            const quizQuestions = await QuizQuestion.find({quizId: room.quizId}).sort({order: 1})
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
                startedAt: new Date(),
                questionStartTime: new Date() // Set initial question start time
            })
            if (!session) {
                throw Error("Failed creating game session")
            }
            return session
        } catch (err) {
            throw err
        }
    }

    static async cleanupRoom({code}) {
        try {
            const room = await Room.findOne({ code })
            if (!room) {
                return
            }
            
            await Room.findByIdAndDelete(room._id)
            await GameSession.findOneAndDelete({room: room._id})
            
        } catch (err) {
            console.error('Error cleaning up room:', err)
        }
    }

    static async getSessionByCode({code, userId}) {
        try {
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
            const quizQuestions = await QuizQuestion.find({quizId: room.quizId}).sort({order: 1})
            
            // Include userId in session data for client-side checks
            const sessionWithUserId = {
                ...session.toObject(),
                userId: userId
            }
            
            return {
                session: sessionWithUserId, 
                host: room.host, 
                creator: userId === room.host.toString(), 
                quiz, 
                quizQuestions,
                userId: userId
            }
        } catch (err) {
            throw err
        }
    }
}

module.exports = RoomService