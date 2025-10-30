import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"
import Icons from "../components/Icons"

export default function Play() {
    const [sessionData, setSessionData] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const {code} = useParams()
    const navigate = useNavigate()
    
    useEffect(() => {
        fetch(`/api/room/${code}/session`, {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setSessionData(data.data)
                console.log(data.data)
            } else {
                toast.error(data.message)
                navigate("/list")
            }
        })
    }, [])

    const handleAnswerSelect = (optionIndex) => {
        const currentQuestion = sessionData.quizQuestions[sessionData.session.currentQuestion]
        
        if (currentQuestion.answerType === "single") {
            // Single choice: replace selection
            setSelectedAnswers([optionIndex])
        } else {
            // Multiple choice: toggle selection
            setSelectedAnswers(prev => {
                if (prev.includes(optionIndex)) {
                    return prev.filter(index => index !== optionIndex)
                } else {
                    return [...prev, optionIndex]
                }
            })
        }
    }

    const isSelected = (optionIndex) => {
        return selectedAnswers.includes(optionIndex)
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
                                            0/1 players answered
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold px-4 py-2 rounded-full bg-green-100 text-green-600">
                                        30s
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
                                            className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                                                selected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {currentQuestion.answerType === "single" ? (
                                                    <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${
                                                        selected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                                                    }`}>
                                                        {selected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                    </div>
                                                ) : (
                                                    <div className={`w-4 h-4 rounded border-2 mr-4 flex items-center justify-center ${
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
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end items-center">
                            <button 
                                disabled={selectedAnswers.length === 0}
                                className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-colors ${
                                    selectedAnswers.length > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Submit Answer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}