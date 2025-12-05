import { useState, useEffect } from "react"
import Navigation from "../components/Navigation.jsx"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import QuizForm from "../components/QuizForm.jsx"

export default function EditQuiz() {
    const [quizData, setQuizData] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const {quizId} = useParams()
    
    useEffect(() => {
        fetch(`/api/quizzes/${quizId}`, {
            credentials: "include",
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setQuizData({
                    _id: quizId,
                    title: data.data.quiz.title,
                    description: data.data.quiz.description,
                    visibility: data.data.quiz.visibility,
                    participants: data.data.quiz.participants,
                    categories: data.data.quiz.categories,
                    quizQuestions: data.data.quizQuestions
                })
            } else {
                toast.error(data.message)
                navigate("/list")
            }
            setLoading(false)
        })
    }, [quizId, navigate])

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navigation />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            {quizData && <QuizForm quiz={quizData} isEdit={true} />}
        </main>
    )
}