import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"
import Avatar from "../components/Avatar"

export default function QuizHome() {
    const [quizData, setQuizData] = useState(null)
    const {quizId} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        fetch(`/api/quizzes/${quizId}`, {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setQuizData(data.data)
            } else {
                toast.error(data.message)
                navigate("/list")
            }
        })
    }, [])

    const handleClick = (action) => {
        if (action === "back") {
            navigate("/list")
        } else if (action === "host") {
            setQuizData(null)
            fetch("/api/room/create", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quizId })
            }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success(data.message)
                    navigate(`room/${data.data.code}`)
                } else {
                    toast.error(data.message)
                    navigate("/list")
                }
            })
        } else if (action === "single") {

        }
    }

    return (
        <>
            <Navigation />
            {!quizData ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : ( <>
                    <div className="max-w-2xl bg-white mx-auto p-4 shadow-sm overflow-hidden rounded mt-5 flex flex-col items-center justify-center">
                        <div className="border-b-1 border-gray-200 pb-5">
                            <h2 className="text-2xl font-bold text-center">{quizData.quiz.title}</h2>
                            <p className="text-gray-500 mt-2 text-center">{quizData.quiz.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-5">
                            <Avatar size="20px" fontSize="10px" name={quizData.username}/>
                            <p className="text-gray-500">{quizData.username}</p>
                            <div className="w-px h-4 bg-gray-400"></div>
                            <p className="text-gray-500">{quizData.quizQuestions.length} questions</p>
                        </div>
                        <div className="w-full flex items-center justify-center space-x-2 mt-5">
                            <button 
                                onClick={() => handleClick("back")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-gray-50 border border-gray-200 text-neutral-500 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => handleClick("start")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Start Quiz
                            </button>
                            <button 
                                onClick={() => handleClick("host")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                            >
                                Host Live
                            </button>
                        </div>
                    </div>
            </>)}
        </>
    )
}
