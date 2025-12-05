import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"
import Icons from "../components/Icons"

export default function Play() {
    const [sessionData, setSessionData] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const [timeLeft, setTimeLeft] = useState(30)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasAnswered, setHasAnswered] = useState(false)
    const [playersAnswered, setPlayersAnswered] = useState(0)
    const [totalPlayers, setTotalPlayers] = useState(0)
    const [userAnswerForCurrentQuestion, setUserAnswerForCurrentQuestion] = useState(null) // Track user's answer for current question
    const {code} = useParams()
    const navigate = useNavigate()
    
    // Function to check if user has already answered current question
    const checkIfAnswered = (sessionData) => {
        if (!sessionData || !sessionData.session) return false
        
        const currentQuestionId = sessionData.quizQuestions[sessionData.session.currentQuestion]?._id
        if (!currentQuestionId) return false
        
        // Check if user has answered this specific question in the session
        const currentParticipant = sessionData.session.participants?.find(p => p.user === sessionData.userId)
        if (currentParticipant) {
            const answerForCurrentQ = currentParticipant.answersHistory?.find(ah => 
                ah.questionId && ah.questionId.toString() === currentQuestionId.toString()
            )
            
            if (answerForCurrentQ) {
                try {
                    const parsedAnswer = JSON.parse(answerForCurrentQ.answer)
                    setUserAnswerForCurrentQuestion(parsedAnswer)
                    setSelectedAnswers(parsedAnswer)
                    return true
                } catch (e) {
                    console.error('Error parsing user answer:', e)
                }
            }
        }
        
        setUserAnswerForCurrentQuestion(null)
        setSelectedAnswers([])
        return false
    }
    
    useEffect(() => {
        fetch(`/api/room/${code}/session`, {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setSessionData(data.data)
                setTimeLeft(data.data.session.settings?.timePerQuestion || 30)
                
                // Check if user has already answered current question
                const alreadyAnswered = checkIfAnswered(data.data)
                setHasAnswered(alreadyAnswered)
            } else {
                toast.error(data.message)
                navigate("/list")
            }
        })
    }, [])

    // Timer countdown
    useEffect(() => {
        if (!sessionData || hasAnswered) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmitAnswer(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [sessionData, hasAnswered])

    // Poll for status updates
    useEffect(() => {
        if (!sessionData) return

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/room/${code}/status`, {
                    credentials: 'include'
                })
                const data = await response.json()
                
                if (data.status === "success") {
                    const { session, playersAnswered: answered, totalPlayers: total } = data.data
                    
                    setPlayersAnswered(answered)
                    setTotalPlayers(total)
                    
                    // Sync timer with server only if user hasn't answered
                    if (!hasAnswered && session.remainingTime !== undefined) {
                        setTimeLeft(session.remainingTime)
                    }
                    
                    // Check if quiz is completed
                    if (session.status === "completed") {
                        // Get user's latest attempt and redirect to results
                        try {
                            const attemptResponse = await fetch(`/api/quiz-attempt/`, {
                                credentials: 'include'
                            })
                            const attemptData = await attemptResponse.json()
                            
                            if (attemptData.status === "success") {
                                const quizAttempts = attemptData.data.filter(attempt => 
                                    attempt.quizId.toString() === sessionData.quiz._id.toString()
                                )
                                
                                if (quizAttempts.length > 0) {
                                    const latestAttempt = quizAttempts.sort((a, b) => 
                                        new Date(b.createdAt) - new Date(a.createdAt)
                                    )[0]
                                    navigate(`/quiz/result/${latestAttempt._id}`)
                                } else {
                                    navigate("/list")
                                }
                            } else {
                                navigate("/list")
                            }
                        } catch (error) {
                            console.error('Error fetching attempts:', error)
                            navigate("/list")
                        }
                        return
                    }
                    
                    // Check if question changed
                    if (session.currentQuestion !== sessionData.session.currentQuestion) {
                        const sessionResponse = await fetch(`/api/room/${code}/session`, {
                            credentials: 'include'
                        })
                        const newSessionData = await sessionResponse.json()
                        
                        if (newSessionData.status === "success") {
                            setSessionData(newSessionData.data)
                            
                            // Check if user has already answered the new question
                            const alreadyAnswered = checkIfAnswered(newSessionData.data)
                            setHasAnswered(alreadyAnswered)
                            
                            if (!alreadyAnswered) {
                                setSelectedAnswers([])
                                setTimeLeft(newSessionData.data.session.settings?.timePerQuestion || 30)
                            }
                            
                            toast.success("Moving to next question...")
                        }
                    }
                }
            } catch (error) {
                console.error('Polling error:', error)
            }
        }, 1000)

        return () => clearInterval(pollInterval)
    }, [sessionData, code, navigate, hasAnswered])

    const handleAnswerSelect = (optionIndex) => {
        if (hasAnswered) return
        
        const currentQuestion = sessionData.quizQuestions[sessionData.session.currentQuestion]
        
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
        if (isSubmitting || hasAnswered) return
        
        setIsSubmitting(true)
        
        try {            
            const response = await fetch(`/api/room/${code}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    questionIndex: sessionData.session.currentQuestion,
                    selectedAnswers: selectedAnswers,
                    timeUsed: (sessionData.session.settings?.timePerQuestion || 30) - timeLeft
                })
            })
            
            const data = await response.json()            
            if (data.status === "success") {
                setHasAnswered(true)
                setUserAnswerForCurrentQuestion(selectedAnswers)
                
                if (isAutoSubmit) {
                    toast.error("Time's up!")
                } else {
                    toast.success("Answer submitted!")
                }
                setPlayersAnswered(data.data.playersAnswered)
                
            } else {
                console.error('Submit answer failed:', data.message)
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isSelected = (optionIndex) => {
        return selectedAnswers.includes(optionIndex)
    }

    const getTimerColor = () => {
        if (timeLeft <= 5) return 'bg-red-100 text-red-600 animate-pulse'
        if (timeLeft <= 10) return 'bg-orange-100 text-orange-600'
        return 'bg-green-100 text-green-600'
    }

    return (
        <>
            <Navigation />
            {!sessionData ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="text-gray-700 py-8">
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Header */}
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
                                        <div className="font-semibold">Question {sessionData.session.currentQuestion + 1} of {sessionData.quizQuestions.length}</div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {playersAnswered}/{totalPlayers} players answered
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold px-4 py-2 rounded-full ${getTimerColor()}`}>
                                        {timeLeft}s
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${((sessionData.session.currentQuestion + 1) / sessionData.quizQuestions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                            <div className="mb-6">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                    {sessionData.quizQuestions[sessionData.session.currentQuestion].answerType.charAt(0).toUpperCase() + sessionData.quizQuestions[sessionData.session.currentQuestion].answerType.slice(1)} Choice
                                </span>
                                <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                                    {sessionData.quizQuestions[sessionData.session.currentQuestion].questionText}
                                </h2>
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {sessionData.quizQuestions[sessionData.session.currentQuestion].options.map((option, key) => {
                                    const selected = isSelected(key)
                                    const currentQuestion = sessionData.quizQuestions[sessionData.session.currentQuestion]
                                    
                                    return (
                                        <button 
                                            key={key} 
                                            onClick={() => handleAnswerSelect(key)}
                                            disabled={hasAnswered}
                                            className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md disabled:cursor-not-allowed ${
                                                selected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            } ${hasAnswered ? 'opacity-75' : ''}`}
                                        >
                                            <div className="flex items-center">
                                                {currentQuestion.answerType === "single" ? (
                                                    <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${
                                                        selected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                                                    }`}>
                                                        {selected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                    </div>
                                                ) : (
                                                    <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center ${
                                                        selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
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

                            {/* Answer Type Indicator */}
                            <div className="mt-6 flex items-center text-sm text-gray-500">
                                <Icons icon="info" className="w-4 h-4 mr-2" />
                                <span>Select {sessionData.quizQuestions[sessionData.session.currentQuestion].answerType === "single" 
                                ? "one answer" : "multiple answers"}</span>
                            </div>

                            {/* Submission Status */}
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

                        {/* Action Buttons */}
                        <div className="flex justify-end items-center">
                            <button 
                                onClick={() => handleSubmitAnswer(false)}
                                disabled={selectedAnswers.length === 0 || hasAnswered || isSubmitting}
                                className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-colors ${
                                    selectedAnswers.length > 0 && !hasAnswered && !isSubmitting
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : hasAnswered ? 'Submitted' : 'Submit Answer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}