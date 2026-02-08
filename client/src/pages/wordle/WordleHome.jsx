import { useState } from 'react'
import Navigation from "../../components/Navigation"
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

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
                    navigate("/wordle")
                }
            })
    }
    return (
        <>
            <Navigation />
            {false ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : (<>
                <div className="mt-20 bg-white flex flex-col items-center justify-center px-6 text-center">
                    <h1 className="text-5xl font-bold tracking-widest mb-4">WORDLE</h1>

                    <p className="text-gray-600 mb-8">
                        Guess the word.
                    </p>

                    <div className="grid grid-cols-5 gap-2 mb-10">
                        {"WORDL".split("").map((l, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center text-xl font-bold"
                            >
                                {l}
                            </div>
                        ))}
                    </div>

                    <button disabled={loading} onClick={handleClick} className="bg-green-600 text-white px-10 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-green-700 transition">
                        Play
                    </button>
                </div>
            </>)}
        </>
    )
}
