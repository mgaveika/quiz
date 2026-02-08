const User = require("../models/Users")
const Quiz = require("../models/Quiz")
const QuizQuestion = require("../models/QuizQuestion")
const AccessTokens = require("../models/AccessTokens")


class AdminService {
    static async getDashboardData() {
        const totalQuizes = await Quiz.countDocuments()
        const totalAttempts = 0
        const registeredUsers = await User.countDocuments()
        const totalQuestions = await QuizQuestion.countDocuments()
        return { totalQuizes, totalAttempts, registeredUsers, totalQuestions }
    }

    static async getUsers({ page, role, search }) {
        const limit = 10
        if (!page || page < 1 || !Number(page)) {
            page = 1
        } else {
            page = Number(page)
        }
        const query = {}
        if (role && role !== "All") {
            query.role = role
        }
        if (search && search.length > 0) {
            query.username = { $regex: search, $options: 'i' }
        }
        const users = await User.find(query).skip((page - 1) * limit).limit(limit)
        const totalUsers = await User.countDocuments(query)
        const usersInfo = await Promise.all(
            users.map(async (user) => {
                const token = await AccessTokens.findOne({ userId: user._id })
                return { ...user.toObject(), isLoggedIn: !!token }
            })
        )

        return { usersInfo, totalPages: Math.ceil(totalUsers / limit), totalUsers }
    }

    static async getQuizzes({ page, categories, search }) {
        const limit = 10
        if (!page || page < 1 || !Number(page)) {
            page = 1
        } else {
            page = Number(page)
        }
        const categoryArray = categories ? categories.split(",").map(c => c.trim()) : []
        const query = {}
        if (categoryArray.length > 0) {
            query.categories = { $in: categoryArray }
        }
        if (search && search.length > 0) {
            query.title = { $regex: search, $options: 'i' }
        }
        const quizzes = await Quiz.find(query).skip((page - 1) * limit).limit(limit)
        const totalQuizzes = await Quiz.countDocuments(query)
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