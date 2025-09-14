import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../components/Icons.jsx"

export default function QuizList() {
    const [privateQuizzes, setPrivateQuizzes] = useState([])
    const [publicQuizzes, setPublicQuizzes] = useState([])
    const [userAttempts, setUserAttempts] = useState([])
    const navigate = useNavigate()
    useEffect(() => {
        fetch("/api/quizzes", {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                setPrivateQuizzes(data.data.privateQuizzes || [])
                setPublicQuizzes(data.data.publicQuizzes || [])
                fetch("/api/quiz-attempt", {
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(data2 => {
                    setUserAttempts(data2.data || [])
                })
            } else {
                toast.error(data.message)
            }
        })
    }, [])

    function getAttemptId(quizId) {
        if (!Array.isArray(userAttempts)) return null;
        const attempt = userAttempts.find(a => a.quizId === quizId);
        return attempt ? attempt._id : null;
    }

    async function handleDeleteQuiz(quizId) {
        fetch(`/api/quizzes/${quizId}`, {
            method: "DELETE",
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setPrivateQuizzes(prev => prev.filter(q => q._id !== quizId))
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
                    <Link to="/create" className="bg-purple-700 hover:bg-purple-800 cursor-pointer text-white px-4 py-2 rounded w-40 font-bold flex items-center justify-center">
                        <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                        Create Quiz
                    </Link>
                </div>
                <div className="w-full bg-white rounded shadow-sm p-5 mb-2">
                    <h2 className="text-2xl font-bold mb-4">My quiz list</h2>
                    {privateQuizzes.length === 0 ? (
                        <div className="text-center">No quizzes found.</div>
                    ) : (
                        <ul className="flex flex-col space-y-2">
                            {privateQuizzes.map(q => (
                                <li key={q._id} className="bg-white shadow-sm p-3 flex justify-between">
                                    <Link to={`/quiz/${q._id}`} className="font-semibold">{q.title}</Link>
                                    <div className="flex items-center">
                                        {getAttemptId(q._id) && <button type="button"
                                            className="ml-2 text-gray-500 hover:text-gray-900 w-5 h-5 cursor-pointer"
                                            onClick={() => navigate(`/quiz/${q._id}/results/${getAttemptId(q._id)}`)}
                                        >
                                            <Icons icon="history"/>
                                        </button>}
                                        <button type="button" onClick={() => navigate(`/quiz/${q._id}/edit`)}
                                            className="ml-2 text-gray-500 hover:text-gray-900 w-5 h-5 cursor-pointer"
                                        >
                                            <Icons icon="pen"/>
                                        </button>
                                        <button type="button" onClick={() => handleDeleteQuiz(q._id)}
                                            className="ml-2 text-red-500 hover:text-red-700 w-5 h-5 cursor-pointer"
                                        >
                                            <Icons icon="bin"/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="w-full bg-white rounded shadow-sm p-5">
                    <h2 className="text-2xl font-bold mb-4">Public quizzes</h2>
                    {publicQuizzes.length === 0 ? (
                        <div className="text-center">No quizzes found.</div>
                    ) : (
                        <ul className="flex flex-col space-y-2">
                            {publicQuizzes.map(q => (
                                <li key={q._id} className="bg-white shadow-sm p-3 flex justify-between">
                                    <Link to={`/quiz/${q._id}`} className="font-semibold">{q.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    )
}