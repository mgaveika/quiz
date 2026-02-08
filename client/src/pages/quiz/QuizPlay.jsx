import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../../components/Icons"

export default function QuizPlay({ gameData, socket }) {
    const [sessionData, setSessionData] = useState(gameData)
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const [timeLeft, setTimeLeft] = useState(() => {
        const timePerQuestion = gameData.session.gameData.settings?.timePerQuestion || 30
        const startTime = gameData.session.gameData.questionStartTime
        if (!startTime) return timePerQuestion

        const elapsed = Math.max(0, Math.floor((new Date() - new Date(startTime)) / 1000))
        const remaining = timePerQuestion - elapsed
        return remaining > 0 ? remaining : 0
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasAnswered, setHasAnswered] = useState(false)
    const [playersAnswered, setPlayersAnswered] = useState(0)
    const [totalPlayers, setTotalPlayers] = useState(gameData.session.participants.length)
    const [playerAttemptId, setPlayerAttemptId] = useState(null)
    const { code } = useParams()
    const navigate = useNavigate()

    const questionIndexRef = useRef(gameData.session.gameData.currentQuestion)

    useEffect(() => {
        fetch(`/api/gameSession/${code}/status`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setPlayersAnswered(data.data.playersAnswered)
                    setTotalPlayers(data.data.totalPlayers)
                }
            })

        fetch(`/api/gameAttempt?sessionId=${gameData.session._id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.data) {
                    const attempt = data.data
                    setPlayerAttemptId(attempt._id)
                    const currentQuestionId = sessionData.quizQuestions[sessionData.session.gameData.currentQuestion]?._id
                    const answer = attempt.answers.find(a => String(a.questionId) === String(currentQuestionId))
                    if (answer) {
                        setHasAnswered(true)
                        setSelectedAnswers(answer.answer || [])
                    }
                }
            })
    }, [code, gameData.session._id])

    useEffect(() => {
        if (hasAnswered) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [hasAnswered])

    // Auto-submit when time is up
    useEffect(() => {
        if (timeLeft === 0 && !hasAnswered && playerAttemptId && !isSubmitting) {
            handleSubmitAnswer(true)
        }
    }, [timeLeft, hasAnswered, playerAttemptId, isSubmitting])

    useEffect(() => {
        if (!socket) return

        socket.on('quiz-players-answered-update', ({ answeredCount, totalPlayers }) => {
            setPlayersAnswered(answeredCount)
            setTotalPlayers(totalPlayers)
        })

        socket.on('quiz-question-changed', ({ currentQuestion, totalQuestions }) => {
            questionIndexRef.current = currentQuestion

            setHasAnswered(false)
            setIsSubmitting(false)
            setSelectedAnswers([])
            setSessionData(prev => ({
                ...prev,
                session: {
                    ...prev.session,
                    gameData: {
                        ...prev.session.gameData,
                        currentQuestion
                    }
                }
            }))
            setPlayersAnswered(0)
            setTimeLeft(sessionData.session.gameData.settings?.timePerQuestion || 30)
            toast("Next question!")
        })

        socket.on('quiz-completed', ({ sessionId }) => {
            fetch(`/api/gameAttempt?sessionId=${sessionId}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success" && data.data) {
                        navigate(`/quiz/result/${data.data._id}`)
                    } else {
                        navigate("/list")
                    }
                })
        })

        return () => {
            socket.off('quiz-players-answered-update')
            socket.off('quiz-question-changed')
            socket.off('quiz-completed')
        }
    }, [socket, navigate, sessionData.session.gameData.settings?.timePerQuestion])

    const handleAnswerSelect = (optionIndex) => {
        if (hasAnswered) return

        const currentQuestion = sessionData.quizQuestions[sessionData.session.gameData.currentQuestion]

        if (currentQuestion.answerType === "single") {
            setSelectedAnswers([optionIndex])
        } else {
            setSelectedAnswers(prev => {
                if (prev.includes(optionIndex)) {
                    return prev.filter(index => index !== optionIndex)
                } else {
                    return [...prev, optionIndex]
                }
            })
        }
    }

    const handleSubmitAnswer = async (isAutoSubmit = false) => {
        if (isSubmitting || hasAnswered || !playerAttemptId) return

        setIsSubmitting(true)

        const finalAnswers = isAutoSubmit ? [] : selectedAnswers

        fetch(`/api/gameAttempt/${playerAttemptId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                selectedAnswers: finalAnswers,
                timeUsed: (sessionData.session.gameData.settings?.timePerQuestion || 30) - timeLeft
            })
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    const latestQuestionIndex = questionIndexRef.current
                    const answeredQuestionIndex = data.data.attempt.answers.length - 1

                    if (latestQuestionIndex === answeredQuestionIndex) {
                        setHasAnswered(true)
                        setPlayersAnswered(data.data.playersAnswered)
                    } else {
                        setHasAnswered(false)
                    }

                    if (isAutoSubmit) {
                        toast.error("Time's up!")
                    } else {
                        toast.success("Answer submitted!")
                    }
                } else {
                    toast.error(data.message)
                }
                setIsSubmitting(false)
            })
            .catch(() => setIsSubmitting(false))
    }

    const isSelected = (optionIndex) => {
        return selectedAnswers.includes(optionIndex)
    }

    const getTimerColor = () => {
        if (timeLeft <= 5) return 'bg-red-100 text-red-600 animate-pulse'
        if (timeLeft <= 10) return 'bg-orange-100 text-orange-600'
        return 'bg-green-100 text-green-600'
    }

    const currentQuestion = sessionData.quizQuestions[sessionData.session.gameData.currentQuestion]

    return (
        <div className="text-gray-700 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {sessionData.quiz.title}
                            </h1>
                            <p className="text-gray-600">{sessionData.quiz.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600 text-center">
                                <div className="font-semibold">Question {sessionData.session.gameData.currentQuestion + 1} of {sessionData.quizQuestions.length}</div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {playersAnswered}/{totalPlayers} players answered
                                </div>
                            </div>
                            <div className={`text-2xl font-bold px-4 py-2 rounded-full ${getTimerColor()}`}>
                                {timeLeft}s
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${((sessionData.session.gameData.currentQuestion + 1) / sessionData.quizQuestions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <div className="mb-6">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase">
                            {currentQuestion.answerType} Choice
                        </span>
                        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, key) => {
                            const selected = isSelected(key)
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleAnswerSelect(key)}
                                    disabled={hasAnswered}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md disabled:cursor-not-allowed ${selected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${hasAnswered ? 'opacity-75' : ''}`}
                                >
                                    <div className="flex items-center">
                                        {currentQuestion.answerType === "single" ? (
                                            <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${selected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                                                }`}>
                                                {selected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                            </div>
                                        ) : (
                                            <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                {selected && <Icons icon="check" className="w-4 h-4 text-white" />}
                                            </div>
                                        )}
                                        <span className="font-medium">{option.option}</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-6 flex items-center text-sm text-gray-500">
                        <Icons icon="info" className="w-4 h-4 mr-2" />
                        <span>Select {currentQuestion.answerType === "single"
                            ? "one answer" : "multiple answers"}</span>
                    </div>

                    {hasAnswered && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                                <Icons icon="check" className="w-5 h-5 mr-2" />
                                <span className="font-medium">Answer submitted!</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                                Waiting for other players... ({playersAnswered}/{totalPlayers} completed)
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center">
                    <button
                        onClick={() => { handleSubmitAnswer(false) }}
                        disabled={selectedAnswers.length === 0 || hasAnswered || isSubmitting}
                        className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-colors ${selectedAnswers.length > 0 && !hasAnswered && !isSubmitting
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : hasAnswered ? 'Submitted' : 'Submit Answer'}
                    </button>
                </div>
            </div>
        </div>
    )
}