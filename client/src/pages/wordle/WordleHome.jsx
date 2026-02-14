import { useState } from 'react'
import Navigation from "../../components/Navigation"
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icons from '../../components/Icons'

export default function WordleHome() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const handleClick = () => {
        setLoading(true)
        fetch("/api/gameSession/create", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameType: "wordle" })
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success(data.message)
                    navigate(`/room/${data.data.roomCode}`)
                } else {
                    toast.error(data.message)
                    setLoading(false)
                }
            })
    }
    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navigation />
            <div className="relative isolate overflow-hidden min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
                {/* Background Decorative Gradient */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-100 to-emerald-100 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center z-10">
                    <div className="mb-12 space-y-4">
                        <div className="flex justify-center gap-3 mb-8">
                            {["W", "O", "R", "D", "L", "E"].map((letter, i) => (
                                <div
                                    key={i}
                                    className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black rounded-2xl border-2 transition-all duration-500 shadow-sm
                                        ${i === 0 ? "bg-emerald-500 border-emerald-500 text-white rotate-[-3deg]" :
                                            i === 2 ? "bg-amber-400 border-amber-400 text-white rotate-[2deg]" :
                                                "bg-white border-slate-200 text-slate-800"}`}
                                >
                                    {letter}
                                </div>
                            ))}
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                            Wordle Extra
                        </h1>
                        <p className="max-w-xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
                            Your rules, your game. Customize word length and attempts, then guess the hidden word.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                        <button
                            disabled={loading}
                            onClick={handleClick}
                            className="w-full sm:w-auto px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-200 transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Icons icon="play" className="w-6 h-6 fill-white" />
                                    <span>Start Playing</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-12 border-t border-slate-100">
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-100 shadow-sm">
                                <Icons icon="wordlength" className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-slate-800">Full Control</h3>
                            <p className="text-sm text-slate-500 font-medium px-4">Adjust word length and number of attempts to suit your style.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-100 shadow-sm">
                                <Icons icon="people" className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-slate-800">Online Play</h3>
                            <p className="text-sm text-slate-500 font-medium px-4">Challenge friends or join public rooms for a word battle.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-100 shadow-sm">
                                <Icons icon="attempt" className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-slate-800">Mental Workout</h3>
                            <p className="text-sm text-slate-500 font-medium px-4">Improve your vocabulary and logic skills with every single game.</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Decorative Glow */}
                <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-emerald-50 to-green-50 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
                </div>
            </div>
        </main>
    )
}
