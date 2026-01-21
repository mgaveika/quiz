import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Home() {
    const [code, setCode] = useState("")
    const navigate = useNavigate()
    const handleCodeChange = (p) => {
        setCode(p)
    }
    const hangleJoinClick = (event) => {
        event.preventDefault()
        fetch(`/api/room/${code}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    navigate(`/room/${code}`)
                } else {
                    toast.error(data.message)
                }
            })
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="text-gray-800 flex flex-col">
                <section className="text-center py-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Your Place to Create and Take Quizzes
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Start testing your knowledge or make your own quiz for others to try!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/list"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow"
                        >
                            Quiz list
                        </Link>
                        <Link
                            to="/create"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl shadow"
                        >
                            Create Quiz
                        </Link>
                    </div>
                    <div className="w-full bg-gray-100 mt-5 py-5">
                        <div className="p-8 bg-white rounded-xl shadow-md max-w-md mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Join a Live Game</h3>
                                <p className="text-gray-500">Enter the game PIN to jump right in!</p>
                            </div>

                            <form onSubmit={hangleJoinClick} className="space-y-4">
                                <div className="relative">
                                    <input
                                        onChange={(e) => handleCodeChange(e.target.value.replace(/[^0-9.]/g, ''))}
                                        value={code}
                                        type="text"
                                        className="w-full bg-white border-2 border-gray-100 px-4 py-4 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder-gray-300"
                                        placeholder="000 000"
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!code}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg ${code
                                        ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Enter Room
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}