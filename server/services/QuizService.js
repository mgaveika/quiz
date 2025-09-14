const Quiz = require("../models/Quiz")
const QuizQuestions = require("../models/QuizQuestion")
const User = require("../models/Users")

class QuizService {
    static async createQuiz({title, description, creator, participants, visibility, categories}) {
        try {
            const existingQuiz = await Quiz.where("title").equals(title).where("creator").equals(creator)
            if (existingQuiz.length > 0) {
                throw new Error("Quiz with this name already exists")
            }
            const newQuiz = await Quiz.create({
                title,
                description,
                creator,
                participants,
                visibility,
                categories
            })
            return newQuiz
        } catch (err) {
            throw err
        }
    }

    static async getUserQuizzes({userId}) {
        try {
            const privateQuizzes = await Quiz.find({ creator: userId })
            const publicQuizzes = await Quiz.find({
                participants: { $elemMatch: { user: userId } },
                creator: { $ne: userId }
            })
            return {privateQuizzes, publicQuizzes}
        } catch (err) {
            throw err
        }
    }

    static async getQuizById({id, userId}) {
        try {
            const quiz = await Quiz.findById(id)
            if (!quiz) { 
                throw new Error("No Quiz found!") 
            }
            const quizQuestions = await QuizQuestions.find({quizId: id})
            if (!quizQuestions) { 
                throw new Error("No Quiz questions found!") 
            }
            const user = await User.findById(userId)
            const username = user ? user.username : "N/A"

            if (String(quiz.creator) === userId) {
                return {quiz, quizQuestions, username}
            } else {
                let allowed = false
                quiz.participants.map((part) => {
                    if (String(part.user) === String(userId)) {
                        allowed = true
                    }
                })
                if (allowed) {
                    return {quiz, quizQuestions, username}
                } else {
                    throw new Error("You're not allowed to visit this page!")
                }
            }
        } catch (err) {
            throw err
        }
    }
    
    static async updateQuiz({id, updatedData}) {
        try {
            return await Quiz.findByIdAndUpdate(id, updatedData, { new: true })
        } catch (err) {
            throw err
        }
    }
    
    static async deleteQuiz({id, userId}) {
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