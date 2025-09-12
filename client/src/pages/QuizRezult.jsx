import { useParams } from "react-router-dom"
import Icons from "../components/Icons"
import Navigation from "../components/Navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function QuizRezult() {
    const {attemptId} = useParams()
    const [result, setResult] = useState(null)
    const [stars, setStars] = useState({sum: -1, saved: -1})
    function renderStars() {
        let starsArray = []
        for (let i = 0; i < 5; i++) {
            starsArray.push(
                <span
                    key={i}
                    className="cursor-pointer"
                    onClick={() => setStars(prev => ({ ...prev, sum: i, saved: i }))}
                    onMouseEnter={() => setStars(prev => ({ ...prev, sum: i }))}
                    onMouseLeave={() => setStars(prev => ({ ...prev, sum: -1 }))}
                >
                    <Icons
                        className={`w-5 h-5 ${(i <= stars.sum || i <= stars.saved) ? "text-yellow-400" : ""}`}
                        icon="star"
                    />
                </span>
            )
        }
        return <div className="flex justify-center text-gray-400">{starsArray}</div>
    }

    const handleRate = () => {
        fetch(`/api/quiz-attempt/${attemptId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                questionId: false,
                answer: false,
                rating: stars.saved+1
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toast.success(data.message);
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
            setStars((prev) => ({...prev, saved: data.data.attempt.rating}))
        })
    }, [])

    return (
        <>
            <Navigation />
            {result === null ? 
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            : (
                <>
                <div className="max-w-5xl bg-white rounded shadow-sm mx-auto p-5 mt-5 flex flex-col">
                    <Icons icon="trophy" className="text-white bg-purple-800 w-20 h-20 p-5 mx-auto rounded-full" />
                    <h2 className="text-2xl font-bold text-center">{result.quiz.title}</h2>
                    <p className="text-gray-600 text-center mt-5">{result.quiz.description}</p>
                    <div className="flex flex-col mx-auto w-100">
                        <div className="flex mt-2">
                            <p className="text-center font-semibold" style={{ width: `${result.attempt.score/result.questions.length*100}%` }}>{result.attempt.score/result.questions.length*100}%</p>
                            <p className="text-center font-semibold" style={{ width: `${(result.questions.length-result.attempt.score)/result.questions.length*100}%` }}>{(result.questions.length-result.attempt.score)/result.questions.length*100}%</p>
                        </div>
                        <div
                            className="h-2 w-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg,rgba(11, 184, 11, 1) ${result.attempt.score/result.questions.length*100}%, rgba(184, 11, 11, 1) 100%)`
                            }}
                        ></div>
                    </div>
                        <span className="mx-auto mt-4 text-gray-400">{stars.saved + 1} out of 5</span>
                        {renderStars()}
                        <button onClick={() => handleRate()}className="mx-auto mt-2 items-center w-fit cursor-pointer px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">Rate</button>
                </div>
                {result.questions.map((question, qid) => (
                    <div key={qid} className="max-w-5xl bg-white rounded shadow-sm mx-auto gap-y-2 p-5 mt-5 flex flex-col">
                        <div className="flex justify-between">
                            <span className="font-bold mb-3" >{question.questionText}</span>
                            <span className="text-gray-400">{qid + 1} of {result.questions.length}</span>
                        </div>
                        {question.options.map((option, oid) => {
                            const answerObj = result.attempt.answers.find(a => a.questionId === question._id)
                            const userAnswer = answerObj ? answerObj.answer : null
                            const isUserAnswer = Array.isArray(userAnswer) && userAnswer.includes(oid)
                            const isCorrect = option.correctAnswer
                            return (
                                <div
                                    key={oid}
                                    className={`w-full p-4 cursor-pointer text-left border-2 rounded-xl
                                    ${isUserAnswer && isCorrect ? "border-green-600 bg-green-50" : 
                                        isUserAnswer && !isCorrect ? "border-red-600 bg-red-50" : 
                                        isCorrect ? "border-green-200 bg-green-50" : "border-gray-200"
                                    }    
                                    `}
                                >
                                    <span className="text-gray-900">
                                        {option.option}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                ))}
                </>
            )}
        </>
    );
}