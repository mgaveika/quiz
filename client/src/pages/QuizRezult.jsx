import { useParams } from "react-router-dom"
import Icons from "../components/Icons"
import Navigation from "../components/Navigation"
import { useEffect, useState } from "react"

export default function QuizRezult() {
    const {attemptId} = useParams()
    const [result, setResult] = useState(null)

    useEffect(() => {
        fetch(`/api/quiz-attempt/${attemptId}`, {
            credentials: "include"
        }).then(res => res.json())
        .then(data => {
            setResult(data.data)
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
                    <span className="text-center text-gray-500">Correct {result.attempt.score} out of {result.questions.length}</span>
                </div>
                {result.questions.map((question, qid) => (
                    <div key={qid} className="max-w-5xl bg-white rounded shadow-sm mx-auto gap-y-2 p-5 mt-5 flex flex-col">
                        <span className="font-bold mb-3" >{question.questionText}</span>
                        {question.options.map((option, oid) => {
                            const userAnswer = result.attempt.answers[qid].answer;
                            const answerType = question.answerType;
                            const isUserAnswer = answerType === "multi"
                                ? Array.isArray(userAnswer) && userAnswer.includes(oid)
                                : oid === userAnswer;
                            const isCorrect = option.correctAnswer;
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