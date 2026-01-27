const quizQuestion = require('../models/QuizQuestion')

class QuizQuestionService {
    static async createQuizQuestion(props) {
        try {
            const { quizId, questionText, options, order, answerType } = props
            const newQuizQuestion = await quizQuestion.create({ quizId, questionText, options, order, answerType })
            return newQuizQuestion
        } catch (err) {
            throw err
        }
    }

    static async deleteQuizQuestion({ quizId, order }) {
        try {
            const deletedQuizQuestion = await quizQuestion.findOneAndDelete({ quizId, order })
            return deletedQuizQuestion
        } catch (err) {
            throw err
        }
    }

    static async deleteQuizQuestions({ quizId }) {
        try {
            const deletedQuizQuestions = await quizQuestion.deleteMany({ quizId })
            return deletedQuizQuestions
        } catch (err) {
            throw err
        }
    }
}

module.exports = QuizQuestionService