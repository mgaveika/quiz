import { useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"

export default function CreateQuiz() {
    const [title, setTitle] = useState("")
    const [questions, setQuestions] = useState([
        { questionText: "", options: ["", ""], correctAnswer: 0 }
    ])
    const navigate = useNavigate()
    const [cookies] = useCookies(["jwt-auth"]) 

    const handleQuestionChange = (questionIndex, newQuestionText) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex ? { ...question, questionText: newQuestionText } : question
        ))
    }

    const handleOptionChange = (questionIndex, optionIndex, newOptionText) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex
                ? { ...question, options: question.options.map((option, optId) => optId === optionIndex ? newOptionText : option) }
                : question
        ))
    }

    const handleCorrectChange = (questionIndex, optionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex ? { ...question, correctAnswer: optionIndex } : question
        ))
    }

    const handleAddAnswer = (questionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex ? { ...question, options: [...question.options, ""] } : question
        ))
    }

    const handleRemoveAnswer = (questionIndex, optionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) => {
            if (key !== questionIndex) return question
            const updatedOptions = question.options.filter((_, optId) => optId !== optionIndex)
            let updatedCorrectAnswer = question.correctAnswer
            if (optionIndex === question.correctAnswer) {
                updatedCorrectAnswer = 0
            }
            else if (optionIndex < question.correctAnswer) {
                updatedCorrectAnswer = question.correctAnswer - 1
            }
            return { ...question, options: updatedOptions, correctAnswer: updatedCorrectAnswer }
        }))
    }

    const handleAddQuestion = () => {
        setQuestions(prevQuestions => [
            ...prevQuestions,
            { questionText: "", options: ["", ""], correctAnswer: 0 }
        ])
    }

    const handleRemoveQuestion = (questionIndex) => {
        setQuestions(prevQuestions =>
            prevQuestions.length > 1
                ? prevQuestions.filter((_, key) => key !== questionIndex)
                : prevQuestions
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = cookies["jwt-auth"]
        const res = await fetch("/api/quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({ title })
        })
        const quiz = await res.json()
        if (!quiz.data) {
            toast.error(quiz.message)
            return
        }
        for (let i = 0; i < questions.length; i++) {
            await fetch("/api/quiz-questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token
                },
                body: JSON.stringify({
                    quizId: quiz.data._id,
                    questionText: questions[i].questionText,
                    options: questions[i].options,
                    correctAnswer: questions[i].correctAnswer,
                    order: i
                })
            })
        }
        toast.success(quiz.message)
        navigate("/my-quizzes")
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="max-w-5xl mx-auto mt-5 flex flex-col bg-white rounded shadow-sm p-5">
                <h1 className="text-2xl font-bold mb-4">Create Quiz</h1>
                <form onSubmit={handleSubmit}>
                    <div className="w-full bg-white rounded shadow-sm p-5 mb-5">
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Quiz Title</label>
                        <input
                            id="title"
                            className="border border-gray-300 rounded p-2 mb-4 w-full"
                            placeholder="Quiz title"
                            value={title}
                            onChange={(e) => (setTitle(e.target.value))}
                            required
                        />
                        {questions.map((q, questionId) => (
                            <div key={questionId} className="block text-sm font-medium mb-2 bg-white shadow-sm rounded p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block mb-2">Question {questionId + 1}</label>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveQuestion(questionId)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm border-1 rounded px-2 py-1">
                                            Remove Question
                                        </button>
                                    )}
                                </div>
                                <input
                                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                                    placeholder="Question"
                                    value={q.questionText}
                                    onChange={e => handleQuestionChange(questionId, e.target.value)}
                                    required
                                />
                                {q.options.map((opt, optionId) => (
                                    <div key={optionId} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2 w-3.5 h-3.5"
                                            checked={q.correctAnswer === optionId}
                                            onChange={() => handleCorrectChange(questionId, optionId)}
                                        />
                                        <input
                                            className="border border-gray-300 rounded p-2 flex-1"
                                            placeholder={`Answer ${optionId + 1}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(questionId, optionId, e.target.value)}
                                            required
                                        />
                                        {q.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAnswer(questionId, optionId)}
                                                className="ml-2 text-red-500 hover:text-red-700 w-5 h-5 cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {q.options.length < 4 &&
                                <button
                                    type="button"
                                    onClick={() => handleAddAnswer(questionId)}
                                    className="border-2 border-dotted border-blue-600 text-blue-600 w-full px-4 py-2 rounded cursor-pointer flex items-center justify-center"
                                >
                                <svg className="w-4 h-4 inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg>
                                    Add Answer
                                </button>}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="border-2 border-dotted cursor-pointer border-gray-500 rounded p-2 mb-4 w-full flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg>
                            Add Question
                        </button>
                    </div>
                    <button type="submit" className="bg-purple-700 hover:bg-purple-800 cursor-pointer text-white px-4 py-2 w-full rounded font-bold">
                        Create Quiz
                    </button>
                </form>
            </div>
        </main>
    )
}