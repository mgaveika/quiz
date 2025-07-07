import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

export default function QuizList() {
    const [quizzes, setQuizzes] = useState([])
    useEffect(() => {
        fetch("/api/quizzes", {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setQuizzes(data.data || []))
            .catch(() => setQuizzes([]))
    }, [])

    async function handleDeleteQuiz(quizId) {
        fetch(`/api/quizzes/${quizId}`, {
            method: "DELETE",
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setQuizzes(prev => prev.filter(q => q._id !== quizId))
                toast.success(data.message)
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
            <div className="max-w-5xl mx-auto mt-5 flex flex-col">
                <div className="flex justify-end mb-3">
                    <Link to="/create-quiz" className="bg-purple-700 hover:bg-purple-800 cursor-pointer text-white px-4 py-2 rounded w-40 font-bold flex items-center justify-center">
                        <svg className="w-4 h-4 inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg>
                        Create Quiz
                    </Link>
                </div>
                <div className="w-full bg-white rounded shadow-sm p-5">
                    {quizzes.length === 0 ? (
                        <div className="text-center">No quizzes found.</div>
                    ) : (
                        <ul className="flex flex-col space-y-2">
                            {quizzes.map(q => (
                                <li key={q._id} className="bg-white shadow-sm p-3 flex justify-between">
                                    <a href="" className="font-semibold">{q.title}</a>
                                    <div className="flex items-center">
                                        <button type="button"
                                            className="ml-2 text-gray-950  w-5 h-5 cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                                            </svg>
                                        </button>
                                        <button type="button" onClick={() => handleDeleteQuiz(q._id)}
                                            className="ml-2 text-red-500 hover:text-red-700 w-5 h-5 cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    )
}