const Quiz = require('../models/Quiz')

class QuizService {
    static async createQuiz(props) {
        try {
            const existingQuiz = await Quiz.where("title").equals(props.title).where("creator").equals(props.creator)
            if (existingQuiz.length > 0) {
                return { msg: "Quiz with this name already exists", msgType: "error" }
            }
            const newQuiz = await Quiz.create({
                title: props.title,
                creator: props.creator
            })
            return newQuiz
        } catch (err) {
            return { msg: err.message, msgType: "error" }
        }
    }

    static async getUserQuizzes(userId) {
        try {
            const quizzes = await Quiz.find({ creator: userId })
            return quizzes
        } catch (err) {
            return { msg: err.message, msgType: "error" }
        }
    }

    static async getQuizById(id) {
        try {
            return await Quiz.findById(id)
        } catch (err) {
            return { msg: err.message, msgType: "error" }
        }
    }
    static async updateQuiz(id, updatedData) {
        try {
            return await Quiz.findByIdAndUpdate(id, updatedData, { new: true })
        } catch (err) {
            return { msg: err.message, msgType: "error" }
        }
    }
    
    static async deleteQuiz(id, userId) {
    try {
        const quiz = await Quiz.findById(id)
        if (!quiz) {
            return { msg: `Quiz with id ${id} was not found.`, msgType: "error" }
        }
        if (quiz.creator.toString() !== userId) {
            return { msg: "You're not allowed to delete this quiz!", msgType: "error" }
        }
        return await Quiz.findByIdAndDelete(id)
    } catch (err) {
        return { msg: err.message, msgType: "error" }
    }
}
}

module.exports = QuizService