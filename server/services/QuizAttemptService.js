const QuizAttempt = require("../models/QuizAttempt")

class QuizQuestionService {
    static async createQuizAttempt({quizId, userId}) {
        try {
            const existingAttempt = await QuizAttempt.findOne({ quizId, user: userId })
            if (existingAttempt) {
                existingAttempt.answers = []
                existingAttempt.score = 0
                await existingAttempt.save()
                return existingAttempt
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
            if (questionId && answer) {
                const existingAnswer = attempt.answers.find(ans => ans.questionId.toString() === questionId.toString())
                if (existingAnswer) {
                    if (JSON.stringify(existingAnswer.answer) === JSON.stringify(answer)) {
                        return attempt
                    }
                    existingAnswer.answer = answer
                } else {
                    attempt.answers.push({ questionId: questionId, answer: answer })
                }
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
            return { attempt, quiz, questions}
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

module.exports = QuizQuestionService