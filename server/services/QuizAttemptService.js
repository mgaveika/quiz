const QuizAttempt = require("../models/QuizAttempt")
const QuizQuestion = require("../models/QuizQuestion")
const Quiz = require("../models/Quiz")

class QuizQuestionService {
    static async createQuizAttempt(quizId, userId) {
        try {
            const existingAttempt = await QuizAttempt.findOne({ quizId: quizId, user: userId })
            if (existingAttempt) {
                existingAttempt.answers = []
                existingAttempt.score = 0
                await existingAttempt.save()
                return existingAttempt
            }
            const newQuizAttempt = await QuizAttempt.create({ quizId: quizId, user: userId })
            return newQuizAttempt
        } catch (err) {
            throw err
        }
    }

    static async updateQuizAttempt(attemptId, questionId, answer) {
        try {
            const attempt = await QuizAttempt.findById(attemptId)
            if (!attempt) {
                throw new Error("Quiz attempt doesn't exist.")
            }
            const existingAnswer = attempt.answers.find(ans => ans.questionId.toString() === questionId.toString())
            if (existingAnswer) {
                if (existingAnswer.answer === answer) {
                    return attempt
                }
                existingAnswer.answer = answer
                await existingAnswer.save()
            } else {
                attempt.answers.push({ questionId: questionId, answer: answer })
            }
            const question = await QuizQuestion.findById(questionId)
            if (question && answer === question.correctAnswer) {
                attempt.score += 1
            }
            await attempt.save()
            return attempt
        } catch (err) {
            throw err
        }
    }
    
    static async getQuizAttempt(attemptId) {
        try {
            const attempt = await QuizAttempt.findById(attemptId)
            if (!attempt) {
                throw new Error("Quiz attempt doesn't exist.")
            }
            const questions = await QuizQuestion.find({quizId: attempt.quizId})
            const quiz = await Quiz.findById(attempt.quizId)
            return { attempt: attempt, quiz: quiz, questions: questions}
        } catch (err) {
            throw err
        }
    }
}

module.exports = QuizQuestionService