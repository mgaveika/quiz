const User = require("../models/Users")
const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const QuizQuestion = require("../models/QuizQuestion")
const AccessTokens = require("../models/AccessTokens")


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
        const usersInfo = await Promise.all(
            users.map(async (user) => {
                const token = await AccessTokens.findOne({ userId: user._id })
                return { ...user.toObject(), isLoggedIn: !!token }
            })
        )

        return { usersInfo, totalPages: Math.ceil(totalUsers / limit), totalUsers }
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
        const quizInfo = await Promise.all(
            quizzes.map(async (quiz) => {
                const totalQuestions = await QuizQuestion.countDocuments({ quizId: quiz._id })
                return { ...quiz.toObject(), totalQuestions }
            })
        )

        return { quizInfo, totalPages: Math.ceil(totalQuizzes / limit), totalQuizzes }
    }

    static async updateRole({ userId, role }) {
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true })
        return user
    }
}

module.exports = AdminService