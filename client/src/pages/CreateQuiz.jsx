import { useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../components/Icons.jsx"

export default function CreateQuiz() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState([
        { questionText: "", options: ["", ""], correctAnswer: 0 }
    ])
    const navigate = useNavigate()

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
        fetch("/api/quizzes", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, description })
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                for (let i = 0; i < questions.length; i++) {
                    fetch("/api/quiz-questions", {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            quizId: data.data._id,
                            questionText: questions[i].questionText,
                            options: questions[i].options,
                            correctAnswer: questions[i].correctAnswer,
                            order: i
                        })
                    }).then(res => res.json())
                    .then(data => {
                        if (data.status == "error") {
                            toast.error(data.message)
                        }
                    })
                }
                toast.success(data.message)
                navigate("/my-quizzes")
            } else if (data.status == "error")  {
                toast.error(data.message)
            } else {
                toast(data.message)
            }
        })
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="max-w-5xl mx-auto mt-5 flex flex-col bg-white rounded shadow-sm p-5">
                <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
                <form onSubmit={handleSubmit}>
                    <div className="w-full bg-white rounded shadow-sm p-5 mb-5">
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                        <input
                            id="title"
                            className="border border-gray-300 rounded p-2 mb-2 w-full"
                            placeholder="Enter quiz title"
                            value={title}
                            onChange={(e) => (setTitle(e.target.value))}
                            required
                        />
                        <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            className="border border-gray-300 rounded p-2 mb-4 w-full"
                            placeholder="Enter quiz description"
                            value={description}
                            onChange={(e) => (setDescription(e.target.value))}
                        />
                        {questions.map((q, questionId) => (
                            <div key={questionId} className="block text-sm font-medium mb-2 bg-white shadow-sm rounded p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="mb-2">Question {questionId + 1}</span>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveQuestion(questionId)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm border-1 rounded px-2 py-1">
                                            Remove Question
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                                    placeholder="Enter your question"
                                    rows={2}
                                    value={q.questionText}
                                    onChange={e => handleQuestionChange(questionId, e.target.value)}
                                    required
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                                    <select
                                        onChange={() => {}}
                                        value="single"
                                        className="px-4 py-2 border border-gray-300 rounded"
                                    >
                                        <option value="single">Single Answer</option>
                                        <option value="multi">Multiple Answers</option>
                                        <option value="connection">Connection/Matching</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2 h-8">
                                    <span>Answer Options</span>
                                    {q.options.length < 4 &&
                                        <button
                                            onClick={() => handleAddAnswer(questionId)}
                                            type="button"
                                            className="flex items-center cursor-pointer space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                        >
                                        <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                                        <span>Add Option</span>
                                        </button>
                                    }
                                </div>
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
                                            placeholder={`Option ${optionId + 1}`}
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
                                            <Icons icon="bin" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="border-2 border-dotted cursor-pointer border-gray-500 rounded p-2 mb-4 w-full flex items-center justify-center"
                        >
                            <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                            Add Question
                        </button>
                    </div>
                    <button type="submit" className="bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer text-white px-4 py-2 w-full rounded font-bold">
                        Create Quiz
                    </button>
                </form>
            </div>
        </main>
    )
}