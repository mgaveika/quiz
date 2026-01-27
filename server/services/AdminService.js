const User = require("../models/Users")
const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const QuizQuestion = require("../models/QuizQuestion")


class AdminService {
    static async getDashboardData() {
        const totalQuizes = await Quiz.countDocuments()
        const totalAttempts = await QuizAttempt.countDocuments()
        const registeredUsers = await User.countDocuments()
        const totalQuestions = await QuizQuestion.countDocuments()
        return { totalQuizes, totalAttempts, registeredUsers, totalQuestions }
    }

    static async getUsers({ page }) {
        const limit = 10
        if (!page || page < 1 || !Number(page)) {
            page = 1
        } else {
            page = Number(page)
        }
        const users = await User.find().skip((page - 1) * limit).limit(limit)
        const totalUsers = await User.countDocuments()

        return { users, totalPages: Math.ceil(totalUsers / limit), totalUsers }
    }

    static async getQuizzes({ page }) {
        const limit = 10
        if (!page || page < 1 || !Number(page)) {
            page = 1
        } else {
            page = Number(page)
        }
        const quizzes = await Quiz.find().skip((page - 1) * limit).limit(limit)
        const totalQuizzes = await Quiz.countDocuments()

        return { quizzes, totalPages: Math.ceil(totalQuizzes / limit), totalQuizzes }
    }
}

module.exports = AdminService