const QuizAttempt = require("../models/QuizAttempt")
const QuizQuestion = require("../models/QuizQuestion")
const Quiz = require("../models/Quiz")
const GameSession = require("../models/GameSession")
const Room = require("../models/Room")

class QuizAttemptService {
    static async createQuizAttempt({quizId, userId}) {
        try {
            // Check for recent attempt to reuse for same session
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
            const recentAttempt = await QuizAttempt.findOne({
                quizId,
                user: userId,
                createdAt: { $gte: tenMinutesAgo }
            }).sort({ createdAt: -1 })
            
            if (recentAttempt) {
                return recentAttempt
            }
            
            const newQuizAttempt = await QuizAttempt.create({ quizId, user: userId })
            return newQuizAttempt
        } catch (err) {
            throw err
        }
    }

    static async updateQuizAttempt({attemptId, questionId, answer, rating}) {
        try {
            const attempt = await QuizAttempt.findById(attemptId)
            if (!attempt) {
                throw new Error("Quiz attempt doesn't exist.")
            }
            
            if (questionId && answer !== undefined) {
                const existingAnswerIndex = attempt.answers.findIndex(ans => ans.questionId.toString() === questionId.toString())
                
                if (existingAnswerIndex !== -1) {
                    // Update existing answer
                    if (JSON.stringify(attempt.answers[existingAnswerIndex].answer) === JSON.stringify(answer)) {
                        return attempt
                    }
                    // Subtract old score if answer was correct
                    const question = await QuizQuestion.findById(questionId)
                    let wasCorrect = false
                    const oldAnswer = attempt.answers[existingAnswerIndex].answer
                    
                    if (question.answerType === "multi") {
                        if (Array.isArray(oldAnswer)) {
                            const correctIndices = question.options
                                .map((opt, idx) => opt.correctAnswer ? idx : null)
                                .filter(idx => idx !== null)
                            wasCorrect = correctIndices.length === oldAnswer.length &&
                                correctIndices.every(idx => oldAnswer.includes(idx))
                        }
                    } else {
                        wasCorrect = question.options[oldAnswer] && question.options[oldAnswer].correctAnswer
                    }
                    
                    if (wasCorrect) {
                        attempt.score -= 1
                    }
                    
                    attempt.answers[existingAnswerIndex].answer = answer
                } else {
                    // Add new answer
                    attempt.answers.push({ questionId: questionId, answer: answer })
                }
                
                // Calculate if new answer is correct
                const question = await QuizQuestion.findById(questionId)
                let isCorrect = false
                if (question.answerType === "multi") {
                    if (Array.isArray(answer)) {
                        const correctIndices = question.options
                            .map((opt, idx) => opt.correctAnswer ? idx : null)
                            .filter(idx => idx !== null)
                        isCorrect = correctIndices.length === answer.length &&
                            correctIndices.every(idx => answer.includes(idx))
                    }
                } else {
                    isCorrect = question.options[answer] && question.options[answer].correctAnswer
                }
                
                if (isCorrect) {
                    attempt.score += 1
                }
            }
            
            if (rating) {
                attempt.rating = rating
            }
            
            await attempt.save()
            return attempt
        } catch (err) {
            throw err
        }
    }
    
    static async getQuizAttempt({attemptId}) {
        try {
            const attempt = await QuizAttempt.findById(attemptId)
            if (!attempt) {
                throw new Error("Quiz attempt doesn't exist.")
            }
            const questions = await QuizQuestion.find({quizId: attempt.quizId})
            const quiz = await Quiz.findById(attempt.quizId)
            
            // Check if this was part of a multiplayer session
            let sessionData = null
            try {
                const sessions = await GameSession.find({
                    "participants.user": attempt.user
                }).populate('participants.user', 'username').populate('room')
                
                const relevantSessions = []
                for (const session of sessions) {
                    if (session.room && session.room.quizId && 
                        session.room.quizId.toString() === attempt.quizId.toString() && 
                        session.status === "completed") {
                        relevantSessions.push(session)
                    }
                }
                
                if (relevantSessions.length > 0) {
                    const latestSession = relevantSessions.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))[0]
                    
                    sessionData = {
                        roomCode: latestSession.room.code,
                        participants: latestSession.participants,
                        startedAt: latestSession.startedAt,
                        endedAt: latestSession.endedAt
                    }
                }
            } catch (error) {
                console.log("No session data found for this attempt:", error)
            }
            
            return { attempt, quiz, questions, sessionData }
        } catch (err) {
            throw err
        }
    }

    static async getUserAttempts({userId}) {
        try {
            const attempts = await QuizAttempt.find({user: userId})
            if (!attempts) {
                throw new Error("No existing attempts found.")
            }
            return attempts
        } catch (err) {
            throw err
        }
    }
}

module.exports = QuizAttemptService