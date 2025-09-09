const quizQuestion = require('../models/QuizQuestion')

class QuizQuestionService {
    static async createQuizQuestion(props) {
        try {
            const newQuizQuestion = await quizQuestion.create({
                quizId: props.quizId,
                questionText: props.questionText,
                options: props.options,
                order: props.order,
                answerType: props.answerType
            })
            return newQuizQuestion
        } catch (err) {
            throw err
        }
    }

    /*static async updateQuizQuestion(quizId, order, updates) {
        try {
            const updatedQuizQuestion = await quizQuestion.findOneAndUpdate(
                { quizId: quizId, order: order },
                {
                    $set: {
                        ...(updates.questionText && { text: updates.questionText }),
                        ...(updates.options && { options: updates.options }),
                        ...(updates.correctAnswer && { correctAnswer: updates.correctAnswer }),
                        ...(updates.order !== undefined && { order: updates.order })
                    }
                },
                { new: true }
            )
            return updatedQuizQuestion
        } catch (err) {
            throw err
        }
    }*/

    static async deleteQuizQuestion(quizId, order) {
        try {
            const deletedQuizQuestion = await quizQuestion.findOneAndDelete({ quizId: quizId, order: order })
            return deletedQuizQuestion
        } catch (err) {
            throw err
        }
    }

    static async deleteQuizQuestions(quizId) {
        try {
            const deletedQuizQuestions = await quizQuestion.deleteMany({ quizId: quizId })
            return deletedQuizQuestions
        } catch (err) {
            throw err
        }
    }
}

module.exports = QuizQuestionService