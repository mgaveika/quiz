const Quiz = require("../models/Quiz")
const QuizQuestions = require("../models/QuizQuestion")
const User = require("../models/Users")
const mongoose = require('mongoose')

class QuizService {
    static async createQuiz({ title, description, creator, participants, visibility, categories }) {
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

    static async getUserQuizzes({ userId, page, categories }) {
        try {
            const limit = 10
            if (!page || page < 1 || !Number(page)) {
                page = 1
            } else {
                page = Number(page)
            }
            const categoryArray = categories ? categories.split(",").map(c => c.trim()) : []
            const query = {
                creator: userId
            }
            if (categoryArray.length > 0) {
                query.categories = { $in: categoryArray };
            }
            const privateQuizzes = await Quiz.find(query).limit(limit).skip((page - 1) * limit)
            const quizzesCount = await Quiz.countDocuments(query)
            return { privateQuizzes, totalPages: Math.ceil(quizzesCount / limit), totalQuizzes: quizzesCount }
        } catch (err) {
            throw err
        }
    }

    static async getPublicQuizzes({ userId, page, categories }) {
        try {
            const limit = 10
            if (!page || page < 1 || !Number(page)) {
                page = 1
            } else {
                page = Number(page)
            }
            const categoryArray = categories ? categories.split(",").map(c => c.trim()) : []
            const query = {
                $or: [
                    { visibility: true },
                    { participants: { user: userId } }
                ]
            };

            if (categoryArray.length > 0) {
                query.categories = { $in: categoryArray };
            }
            const publicQuizzes = await Quiz.find(query).limit(limit).skip((page - 1) * limit)
            const quizzesCount = await Quiz.countDocuments(query)
            return { publicQuizzes, totalPages: Math.ceil(quizzesCount / limit), totalQuizzes: quizzesCount }
        } catch (err) {
            throw err
        }
    }

    static async getFilteredQuizzes({ userId, array }) {
        try {
            const filteredQuizzes = await Quiz.find({
                participants: { $elemMatch: { user: userId } },
                creator: { $ne: userId },
                categories: { $all: array }
            })
            return filteredQuizzes
        } catch (err) {
            throw err
        }
    }

    static async getQuizById({ id, userId }) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Quiz not found")
            }
            const quiz = await Quiz.findById(id)
            if (!quiz) {
                throw new Error("Quiz not found")
            }
            const quizQuestions = await QuizQuestions.find({ quizId: id })
            if (!quizQuestions) {
                throw new Error("Quiz questions not found")
            }
            const user = await User.findById(quiz.creator)
            const username = user ? user.username : "N/A"

            if (String(quiz.creator) === userId) {
                return { quiz, quizQuestions, username, creator: true }
            } else {
                let allowed = false
                quiz.participants.map((part) => {
                    if (String(part.user) === String(userId)) {
                        allowed = true
                    }
                })
                if (allowed || quiz.visibility) {
                    return { quiz, quizQuestions, username, creator: false }
                } else {
                    throw new Error("You're not allowed to visit this page!")
                }
            }
        } catch (err) {
            throw err
        }
    }

    static async updateQuiz({ id, updatedData }) {
        try {
            return await Quiz.findByIdAndUpdate(id, updatedData, { new: true })
        } catch (err) {
            throw err
        }
    }

    static async deleteQuiz({ id, userId }) {
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