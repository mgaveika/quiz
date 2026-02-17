const QuizAttempt = require('../../models/attempts/QuizAttempt')
const QuizQuestion = require('../../models/QuizQuestion')
const GameSession = require('../../models/sessions/Main')
const Quiz = require('../../models/Quiz')

class QuizService {
    static async createAttempt({ userId, guest, sessionId, extraData }) {
        const data = {
            session: sessionId,
            gameType: 'quiz',
            quizId: extraData.quizId,
            [guest ? 'guest' : 'user']: userId
        }
        return await QuizAttempt.create(data)
    }

    static async getAttempt({ userId, guest, sessionId }) {
        const query = {
            [guest ? 'guest' : 'user']: userId
        }
        if (sessionId) {
            query.session = sessionId
        }

        return await QuizAttempt.findOne(query).sort({ createdAt: -1 })
    }

    static async updateAttempt({ userId, guest, attemptId, updateData, io }) {
        const attempt = await QuizAttempt.findById(attemptId)
        if (!attempt) throw new Error("Attempt not found")

        // Validate ownership
        const isAttemptOwner = (guest && attempt.guest === userId) || (!guest && String(attempt.user) === String(userId))
        if (!isAttemptOwner) throw new Error("Access denied: You do not own this attempt")

        const session = await GameSession.findById(attempt.session)
        if (!session) throw new Error("Session not found")

        // Handle rating update
        if (updateData.rating !== undefined) {
            attempt.rating = updateData.rating
            await attempt.save()
            return { attempt, playersAnswered: 0 } // playersAnswered not relevant here
        }

        const currentQuestion = await QuizQuestion.findOne({
            quizId: session.gameData.quizId,
            order: session.gameData.currentQuestion
        })
        if (!currentQuestion) throw new Error("Question not found")

        const alreadyAnswered = attempt.answers.some(a => String(a.questionId) === String(currentQuestion._id))
        if (alreadyAnswered) return { attempt, playersAnswered: await this.getAnsweredCount(session, currentQuestion._id) }

        let isCorrect = false
        const selectedAnswers = updateData.selectedAnswers || []

        if (currentQuestion.answerType === 'single') {
            const correctOptionIndex = currentQuestion.options.findIndex(o => o.correctAnswer === true)
            isCorrect = selectedAnswers.includes(correctOptionIndex)
        } else if (currentQuestion.answerType === 'multi') {
            const correctIndices = currentQuestion.options
                .map((o, i) => o.correctAnswer === true ? i : null)
                .filter(i => i !== null)
            isCorrect = selectedAnswers.length === correctIndices.length &&
                selectedAnswers.every(val => correctIndices.includes(val))
        }

        attempt.answers.push({
            questionId: currentQuestion._id,
            answer: selectedAnswers
        })
        if (isCorrect) attempt.score += 1
        await attempt.save()

        const answeredCount = await this.getAnsweredCount(session, currentQuestion._id)

        const totalQuestions = await QuizQuestion.countDocuments({ quizId: session.gameData.quizId })
        if (answeredCount >= session.participants.length) {
            if (session.gameData.currentQuestion + 1 < totalQuestions) {
                session.gameData.currentQuestion += 1
                session.gameData.questionStartTime = new Date()
                await session.save()
                if (io) io.to(String(session.roomCode)).emit('quiz-question-changed', {
                    currentQuestion: session.gameData.currentQuestion,
                    totalQuestions
                })
            } else {
                session.status = 'completed'
                await session.save()
                if (io) io.to(String(session.roomCode)).emit('quiz-completed', {
                    sessionId: session._id
                })
            }
        } else {
            if (io) io.to(String(session.roomCode)).emit('quiz-players-answered-update', {
                answeredCount,
                totalPlayers: session.participants.length
            })
        }

        return { attempt, playersAnswered: answeredCount }
    }

    static async startGame({ session, settings, participants, GameAttemptService }) {
        session.gameData.settings = { ...session.gameData.settings, ...settings }

        const participantAttempts = []
        for (const p of participants) {
            const isGuest = String(p.userId).startsWith('guest_')
            const attempt = await GameAttemptService.createGameAttempt({
                userId: p.userId,
                guest: isGuest,
                sessionId: session._id,
                gameType: 'quiz',
                extraData: { quizId: session.gameData.quizId._id }
            })

            participantAttempts.push({
                [isGuest ? 'guest' : 'user']: p.userId,
                username: p.username,
                attemptId: attempt._id
            })
        }

        session.participants = participantAttempts
        session.status = 'in-progress'
        session.gameData.currentQuestion = 0
        session.gameData.questionStartTime = new Date()

        await session.save()
        return session
    }

    static async getGameStatus({ session }) {
        const totalPlayers = session.participants.length
        let playersAnswered = 0

        const currentQuestion = await QuizQuestion.findOne({
            quizId: session.gameData.quizId,
            order: session.gameData.currentQuestion
        })

        if (currentQuestion) {
            playersAnswered = await QuizAttempt.countDocuments({
                session: session._id,
                'answers.questionId': currentQuestion._id
            })
        }

        return {
            session: {
                status: session.status,
                currentQuestion: session.gameData.currentQuestion,
            },
            playersAnswered,
            totalPlayers
        }
    }

    static async getQuizResult(attemptId) {
        const attempt = await QuizAttempt.findById(attemptId).populate('quizId')
        if (!attempt) throw new Error("Attempt not found")

        const questions = await QuizQuestion.find({ quizId: attempt.quizId._id }).sort({ order: 1 })

        let leaderboard = []
        if (attempt.session) {
            const sessionAttempts = await QuizAttempt.find({ session: attempt.session })
            // We need usernames. We can get them from session or users.
            const session = await GameSession.findById(attempt.session)
            if (session) {
                leaderboard = session.participants.map(p => {
                    const pId = p.user || p.guest
                    const pAttempt = sessionAttempts.find(a =>
                        (p.user && String(a.user) === String(p.user)) ||
                        (p.guest && a.guest === p.guest)
                    )
                    return {
                        id: pId,
                        name: p.username,
                        score: pAttempt ? pAttempt.score : 0,
                        isCurrent: String(pAttempt?._id) === String(attemptId)
                    }
                }).sort((a, b) => b.score - a.score)
            }
        }

        return {
            quiz: attempt.quizId,
            attempt,
            questions,
            leaderboard,
            totalQuestions: questions.length
        }
    }

    static async getUserHistory({ userId, guest, page = 1, search }) {
        const limit = 12
        const skip = (page - 1) * limit
        const query = { [guest ? 'guest' : 'user']: userId, gameType: 'quiz' }

        if (search) {
            const matchingQuizzes = await Quiz.find({ title: { $regex: search, $options: 'i' } }).select('_id')
            query.quizId = { $in: matchingQuizzes.map(q => q._id) }
        }

        const totalQuizzes = await QuizAttempt.countDocuments(query)
        const totalPages = Math.ceil(totalQuizzes / limit)

        const attempts = await QuizAttempt.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'quizId',
                populate: { path: 'creator', select: 'username' }
            })
            .lean()

        const attemptQuizzes = attempts.map(a => {
            if (!a.quizId) return null
            const q = a.quizId
            return {
                ...q,
                _id: a._id,
                actualQuizId: q._id,
                categories: q.categories || [],
                score: a.score,
                date: a.createdAt
            }
        }).filter(q => q !== null)

        return { attemptQuizzes, totalPages, totalQuizzes }
    }

    static async getAnsweredCount(session, questionId) {
        return await QuizAttempt.countDocuments({
            session: session._id,
            'answers.questionId': questionId
        })
    }
}

module.exports = QuizService
