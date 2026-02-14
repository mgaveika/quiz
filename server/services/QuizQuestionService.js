const quizQuestion = require('../models/QuizQuestion')
const Quiz = require('../models/Quiz')

class QuizQuestionService {
    static async createQuizQuestion(props) {
        try {
            const { quizId, questionText, options, order, answerType, userId } = props

            const quiz = await Quiz.findById(quizId)
            if (!quiz) throw new Error("Quiz not found")
            if (String(quiz.creator) !== String(userId)) {
                throw new Error("You're not allowed to add questions to this quiz!")
            }

            const newQuizQuestion = await quizQuestion.create({ quizId, questionText, options, order, answerType })
            return newQuizQuestion
        } catch (err) {
            throw err
        }
    }

    static async deleteQuizQuestion({ quizId, order, userId }) {
        try {
            const quiz = await Quiz.findById(quizId)
            if (!quiz) throw new Error("Quiz not found")
            if (String(quiz.creator) !== String(userId)) {
                throw new Error("You're not allowed to delete questions from this quiz!")
            }

            const deletedQuizQuestion = await quizQuestion.findOneAndDelete({ quizId, order })
            return deletedQuizQuestion
        } catch (err) {
            throw err
        }
    }

    static async deleteQuizQuestions({ quizId, userId }) {
        try {
            const quiz = await Quiz.findById(quizId)
            if (!quiz) throw new Error("Quiz not found")
            if (String(quiz.creator) !== String(userId)) {
                throw new Error("You're not allowed to delete questions from this quiz!")
            }

            const deletedQuizQuestions = await quizQuestion.deleteMany({ quizId })
            return deletedQuizQuestions
        } catch (err) {
            throw err
        }
    }
}

module.exports = QuizQuestionService