const quizQuestion = require('../models/QuizQuestion')

class QuizQuestionService {
    static async createQuizQuestion(props) {
        try {
            const newQuizQuestion = await quizQuestion.create({
                quizId: props.quizId,
                questionText: props.questionText,
                options: props.options,
                correctAnswer: props.correctAnswer,
                order: props.order
            })
            return newQuizQuestion
        } catch (err) {
            console.log(err)
        }
    }

    static async updateQuizQuestion(quizId, order, updates) {
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
            console.log(err)
        }
    }

    static async deleteQuizQuestion(quizId, order) {
        try {
            const deletedQuizQuestion = await quizQuestion.findOneAndDelete({ quizId: quizId, order: order })
            return deletedQuizQuestion
        } catch (err) {
            console.log(err)
        }
    }

    static async deleteQuizQuestions(quizId) {
        try {
            const deletedQuizQuestions = await quizQuestion.deleteMany({ quizId: quizId })
            return deletedQuizQuestions
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = QuizQuestionService