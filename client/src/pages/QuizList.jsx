import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link } from "react-router"
import toast from "react-hot-toast"


export default function QuizList() {
    const [auth, setAuth] = useState({ loading: true, isAuthenticated: false, user: null })
    const [quizzes, setQuizzes] = useState([])

    function logout() {
        localStorage.removeItem("token")
        setAuth({ loading: false, isAuthenticated: false, user: null })
        window.location.href = "/"
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            logout()
            return
        }
        fetch("http://localhost:3000/api/auth/isAuthenticated", {
            headers: { "x-access-token": token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.auth) {
                    setAuth({ loading: false, isAuthenticated: true, user: data.user })
                } else {
                    logout()
                }
            })
            .catch(() => setAuth({ loading: false, isAuthenticated: false, user: null }))
    }, [])

    useEffect(() => {
        if (!auth.isAuthenticated) return
        const token = localStorage.getItem("token")
        fetch("http://localhost:3000/api/quizzes", {
            headers: { "x-access-token": token }
        })
            .then(res => res.json())
            .then(data => setQuizzes(data || []))
            .catch(() => setQuizzes([]))
    }, [auth.isAuthenticated])

    async function handleDeleteQuiz(quizId) {
        const token = localStorage.getItem("token")
        if (!token) {
            logout()
            return
        }
        const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
            method: "DELETE",
            headers: { "x-access-token": token }
        })
        if (response.ok) {
            setQuizzes(prev => prev.filter(q => q._id !== quizId))
            const response2 = await fetch(`http://localhost:3000/api/quiz-questions/${quizId}`, {
                method: "DELETE",
                headers: { "x-access-token": token }
            })
            if (response2.ok) {
                toast.success("Quiz has been successfully deleted!")
                return
            }
        }
        toast.error("An error appeared when deleting quiz!")
    }

    return (
        <main className="min-h-screen">
            {auth.loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : <> 
                <Navigation auth={auth} logout={logout}/>
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
            </>}
        </main>
    )
}