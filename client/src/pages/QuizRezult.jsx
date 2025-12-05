import { useParams } from "react-router-dom"
import Icons from "../components/Icons"
import Navigation from "../components/Navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function QuizRezult() {
    const {attemptId} = useParams()
    const [result, setResult] = useState(null)
    const [stars, setStars] = useState({sum: -1, saved: -1})
    
    const handleRate = (rating) => {
        setStars(prev => ({ ...prev, saved: rating }))
        
        fetch(`/api/quiz-attempt/${attemptId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                questionId: false,
                answer: false,
                rating: rating + 1  // This saves as 1-5 in database
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toast.success("Rating saved!");
            } else {
                toast.error(data.message);
            }
        })
    }
    
    useEffect(() => {
        fetch(`/api/quiz-attempt/${attemptId}`, {
            credentials: "include"
        }).then(res => res.json())
        .then(data => {
            setResult(data.data)
            // Fix: Convert from 1-5 database value back to 0-4 for UI
            const dbRating = data.data.attempt.rating
            const uiRating = dbRating > 0 ? dbRating - 1 : -1
            setStars((prev) => ({...prev, saved: uiRating}))
        })
    }, [])

    if (result === null) {
        return (
            <>
                <Navigation />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </>
        )
    }

    const scorePercentage = (result.attempt.score / result.questions.length) * 100
    const getScoreColor = () => {
        if (scorePercentage >= 80) return 'text-green-600'
        if (scorePercentage >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBgColor = () => {
        if (scorePercentage >= 80) return 'from-green-500 to-green-600'
        if (scorePercentage >= 60) return 'from-yellow-500 to-yellow-600'
        return 'from-red-500 to-red-600'
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto px-4 mt-5">
                    
                    {/* Results Header Card - Redesigned */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getScoreBgColor()} flex items-center justify-center shadow-md`}>
                                        <Icons icon="trophy" className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{result.quiz.title}</h1>
                                        <p className="text-gray-600 text-sm">{result.quiz.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Score Display - More compact */}
                            <div className="text-right">
                                <div className="text-lg">
                                    {result.attempt.score}/{result.questions.length} correct
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar - Slimmer */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                                <span>Progress Overview</span>
                                <span>{Math.round(scorePercentage)}% completed correctly</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                <div 
                                    className={`h-2 bg-gradient-to-r ${getScoreBgColor()} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${scorePercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Rating Section - Column layout */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Rate this quiz</h3>
                                <div className="text-sm text-gray-500 mb-4">
                                    {stars.saved >= 0 ? `Your rating: ${stars.saved + 1}/5 stars` : 'Click stars to rate'}
                                </div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span
                                            key={i}
                                            className="cursor-pointer transition-all hover:scale-110"
                                            onClick={() => handleRate(i)}
                                            onMouseEnter={() => setStars(prev => ({ ...prev, sum: i }))
                                            }
                                            onMouseLeave={() => setStars(prev => ({ ...prev, sum: -1 }))
                                            }
                                        >
                                            <Icons
                                                className={`w-6 h-6 transition-colors ${(i <= stars.sum || i <= stars.saved) ? "text-yellow-400" : "text-gray-300"}`}
                                                icon="star"
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Results */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded"></div>
                            Question Review
                        </h2>
                        
                        {result.questions.map((question, qid) => {
                            const answerObj = result.attempt.answers.find(a => a.questionId === question._id)
                            const userAnswer = answerObj ? answerObj.answer : null
                            const isQuestionCorrect = question.options.some(opt => 
                                opt.correctAnswer && Array.isArray(userAnswer) && userAnswer.includes(question.options.indexOf(opt))
                            )

                            return (
                                <div key={qid} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    isQuestionCorrect 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {isQuestionCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                                                {question.questionText}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-gray-500 ml-4">
                                            {qid + 1} of {result.questions.length}
                                        </div>
                                    </div>

                                    {/* Answer Options */}
                                    <div className="space-y-3">
                                        {question.options.map((option, oid) => {
                                            const isUserAnswer = Array.isArray(userAnswer) && userAnswer.includes(oid)
                                            const isCorrect = option.correctAnswer
                                            
                                            let optionStyle = "border-gray-200 bg-gray-50"
                                            let iconColor = "text-gray-400"
                                            let icon = null
                                            
                                            if (isUserAnswer && isCorrect) {
                                                optionStyle = "border-green-300 bg-green-50"
                                                iconColor = "text-green-600"
                                                icon = "check"
                                            } else if (isUserAnswer && !isCorrect) {
                                                optionStyle = "border-red-300 bg-red-50"
                                                iconColor = "text-red-600"
                                                icon = "wrong"
                                            } else if (!isUserAnswer && isCorrect) {
                                                optionStyle = "border-green-200 bg-green-25 ring-2 ring-green-100"
                                                iconColor = "text-green-500"
                                                icon = "check"
                                            }

                                            return (
                                                <div
                                                    key={oid}
                                                    className={`flex items-center p-4 border-2 rounded-lg transition-all ${optionStyle}`}
                                                >
                                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${iconColor}`}>
                                                        {icon  &&
                                                            <Icons icon={icon} className="w-4 h-4" />
                                                        }
                                                    </div>
                                                    <span className="text-gray-800 font-medium flex-1">
                                                        {option.option}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}