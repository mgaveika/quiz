const Quiz = require("../models/Quiz")
const QuizQuestions = require("../models/QuizQuestion")
const User = require("../models/Users")

class QuizService {
    static async createQuiz(props) {
        try {
            const title = props.title
            const description = props.description ? props.description : ""
            const creator = props.creator
            const existingQuiz = await Quiz.where("title").equals(title).where("creator").equals(creator)
            if (existingQuiz.length > 0) {
                throw new Error("Quiz with this name already exists")
            }
            const newQuiz = await Quiz.create({
                title: title,
                description: description,
                creator: creator
            })
            return newQuiz
        } catch (err) {
            throw err
        }
    }

    static async getUserQuizzes(userId) {
        try {
            const quizzes = await Quiz.find({ creator: userId })
            if (!quizzes) { 
                throw new Error("No Quizzes found!") 
            }
            return quizzes
        } catch (err) {
            throw err
        }
    }

    static async getQuizById(id) {
        try {
            const quiz = await Quiz.findById(id)
            if (!quiz) { 
                throw new Error("No Quiz found!") 
            }
            const quizQuestions = await QuizQuestions.find({quizId: id})
            if (!quizQuestions) { 
                throw new Error("No Quiz questions found!") 
            }
            const user = await User.findById(quiz.creator)
            const username = user ? user.username : "N/A"
            return {quiz, quizQuestions, username}
        } catch (err) {
            throw err
        }
    }
    static async updateQuiz(id, updatedData) {
        try {
            return await Quiz.findByIdAndUpdate(id, updatedData, { new: true })
        } catch (err) {
            throw err
        }
    }
    
    static async deleteQuiz(id, userId) {
    try {
        const quiz = await Quiz.findById(id)
        if (!quiz) {
            throw new Error(`Quiz with id ${id} was not found.`)
        }
        if (quiz.creator.toString() !== userId) {
            throw new Error("You're not allowed to delete this quiz!")
        }
        await Quiz.findByIdAndDelete(id)
        return await QuizQuestions.deleteMany({ quizId: id })
    } catch (err) {
        throw err
    }
}
}

module.exports = QuizService