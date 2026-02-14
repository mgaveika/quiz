import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link, useNavigate } from "react-router-dom"
import Icons from "../components/Icons.jsx"

export default function Home() {
    const [code, setCode] = useState("")
    const navigate = useNavigate()

    const handleJoinClick = (event) => {
        event.preventDefault()
        if (code.length === 6) {
            navigate(`/room/${code}`)
        }
    }

    const games = [
        {
            title: "Trivia Quizzes",
            description: "Test your knowledge on thousands of topics or create your own.",
            icon: "quiz",
            link: "/list",
            color: "from-blue-500 to-indigo-600",
            buttonText: "Browse Quizzes"
        },
        {
            title: "Wordle Challenge",
            description: "Daily word puzzle. Guess the 5-letter word in 6 attempts.",
            icon: "star",
            link: "/wordle",
            color: "from-emerald-500 to-teal-600",
            buttonText: "Play Wordle"
        }
    ]

    return (
        <main className="min-h-screen pb-20">
            <Navigation />

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                {/* Hero Section */}
                <section className="text-center mb-20 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -z-10" />
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        The Ultimate <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Social Gaming</span> Experience
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Play with friends, challenge your mind, and create unforgettable moments with our collection of interactive games.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/list"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200"
                        >
                            Explore Games
                        </Link>
                        <Link
                            to="/create"
                            className="bg-white hover:bg-gray-50 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg border border-gray-200 shadow-sm"
                        >
                            Create a Quiz
                        </Link>
                    </div>
                </section>

                {/* Join Live Section */}
                <section className="mb-24">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl max-w-2xl mx-auto p-1.5 rounded-[2.5rem]">
                        <div className="bg-white rounded-[2rem] p-8 md:p-12 text-center border border-gray-100">
                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Icons icon="play" className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-800 mb-2">Join a Live Session</h3>
                            <p className="text-gray-400 font-medium mb-10">Have a game PIN? Enter it below to start playing!</p>

                            <form onSubmit={handleJoinClick} className="max-w-md mx-auto relative">
                                <input
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9.]/g, ''))}
                                    value={code}
                                    type="text"
                                    className="w-full bg-gray-50 border-2 border-transparent px-6 py-6 rounded-3xl text-center text-4xl font-black tracking-[0.5em] focus:bg-white focus:border-indigo-500 placeholder-gray-200 text-indigo-600 shadow-inner"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                <button
                                    type="submit"
                                    disabled={code.length < 6}
                                    className={`w-full mt-6 py-5 rounded-3xl font-black text-xl shadow-xl ${code.length === 6
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-200 cursor-pointer"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Enter Game Room
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Game Grid */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {games.map((game, idx) => (
                            <Link key={idx} to={game.link} className="group">
                                <div className="bg-white/70 border border-white hover:border-indigo-400 h-full rounded-[2.5rem] p-8 md:p-10 flex flex-col items-start text-left">
                                    <div className={`w-14 h-14 bg-gradient-to-tr ${game.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                                        <Icons icon={game.icon} className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-800 mb-3">{game.title}</h4>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                        {game.description}
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold">
                                        <span>{game.buttonText}</span>
                                        <Icons icon="dropdown-arrow" className="w-5 h-5 -rotate-90" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
