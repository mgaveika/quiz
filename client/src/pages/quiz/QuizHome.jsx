import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navigation from "../../components/Navigation"
import toast from "react-hot-toast"
import Avatar from "../../components/Avatar"
import Icons from "../../components/Icons"

export default function QuizHome() {
    const [quizData, setQuizData] = useState(null)
    const { quizId } = useParams()
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
        } else if (action === "edit") {
            navigate(`/quiz/${quizId}/edit`)
        } else if (action === "start") {
            fetch("/api/gameSession/create", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ gameType: "quiz", quizId })
            }).then(res => res.json())
                .then(data => {
                    if (data.status == "success") {
                        toast.success(data.message)
                        navigate(`/room/${data.data.roomCode}`)
                    } else {
                        toast.error(data.message)
                        navigate("/list")
                    }
                })
        }
    }

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navigation />
            {!quizData ? (
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                        <div className="h-4 w-32 bg-slate-100 rounded"></div>
                    </div>
                </div>
            ) : (
                <div className="relative isolate overflow-hidden min-h-[calc(100vh-64px)] flex flex-col">
                    {/* Background Decorative Elements */}
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-purple-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 text-center flex-1 flex flex-col justify-center">
                        <button
                            onClick={() => handleClick("back")}
                            className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-all mb-8 cursor-pointer hover:-translate-x-1"
                        >
                            <Icons icon="dropdown-arrow" className="w-5 h-5 rotate-90" />
                            <span>Back</span>
                        </button>

                        <div className="space-y-6 mb-10">
                            {quizData.quiz.categories && quizData.quiz.categories.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {quizData.quiz.categories.map((cat, i) => (
                                        <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                                {quizData.quiz.title}
                            </h1>

                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                                {quizData.quiz.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
                            <div className="flex items-center gap-3">
                                <Avatar size="40px" fontSize="16px" name={quizData.username} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Host</p>
                                    <p className="font-bold text-slate-700">{quizData.username}</p>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Icons icon="quiz" className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                                    <p className="font-bold text-slate-700">{quizData.quizQuestions.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <button
                                onClick={() => handleClick("start")}
                                className="w-full sm:w-auto px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
                            >
                                <Icons icon="play" className="w-6 h-6 fill-white" />
                                <span>Start Now</span>
                            </button>

                            {quizData.creator && (
                                <button
                                    onClick={() => handleClick("edit")}
                                    className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Icons icon="pen" className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
