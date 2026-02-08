import { useParams, useNavigate } from "react-router-dom"
import Icons from "../../components/Icons"
import Navigation from "../../components/Navigation"
import { useEffect, useState, useContext } from "react"
import toast from "react-hot-toast"
import { AuthContext } from "../../utils/AuthContext"

export default function WordleResult() {
    const { attemptId } = useParams()
    const { user } = useContext(AuthContext)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const currentUserId = user?.user?.id || user?.user?._id || user?.id || user?._id

    useEffect(() => {
        fetch(`/api/gameAttempt/id/${attemptId}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setResult(data.data)
                } else {
                    toast.error(data.message)
                    navigate("/")
                }
                setLoading(false)
            })
            .catch(err => {
                toast.error(err.message)
                navigate("/")
            })
    }, [attemptId, navigate])

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                </div>
            </>
        )
    }

    if (!result) return null

    const secretWord = (result.word || "").toUpperCase()
    const results = (result.results || []).map(r => {
        const userId = r.user?._id || r.user || r.guest
        return {
            ...r,
            userId: String(userId || ""),
            solved: r.attempts.some(g => g.toUpperCase() === secretWord)
        }
    })

    const myResult = results.find(r => r.userId === String(currentUserId || ""))
    const otherResults = results.filter(r => r.userId !== String(currentUserId || ""))

    const evaluateGuess = (guess, word) => {
        if (!guess || !word) return []
        const wordArr = word.toUpperCase().split("")
        const guessArr = guess.toUpperCase().split("")
        const results = Array(wordArr.length).fill("wrong")
        const inventory = {}

        wordArr.forEach(char => inventory[char] = (inventory[char] || 0) + 1)

        guessArr.forEach((char, i) => {
            if (char === wordArr[i]) {
                results[i] = "correct"
                inventory[char]--
            }
        })

        guessArr.forEach((char, i) => {
            if (results[i] !== "correct" && inventory[char] > 0) {
                results[i] = "partial"
                inventory[char]--
            }
        })
        return results
    }

    const AttemptGrid = ({ person }) => {
        const username = person.username
        const solved = person.solved

        return (
            <div className={`p-4 rounded-xl shadow-md border border-gray-200 bg-white`}>
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700">{username}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${solved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {solved ? `${person.attempts.length}/${result.maxWordleAttempts}` : "Failed"}
                    </span>
                </div>
                <div className="flex flex-col gap-1.5 items-center">
                    {person.attempts.map((guess, i) => (
                        <div key={i} className="flex gap-1">
                            {evaluateGuess(guess, secretWord).map((status, j) => (
                                <div
                                    key={j}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm ${status === 'correct' ? 'bg-green-500' :
                                        status === 'partial' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}
                                >
                                    {guess[j]}
                                </div>
                            ))}
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, result.maxWordleAttempts - person.attempts.length) }).map((_, i) => (
                        <div key={i + person.attempts.length} className="flex gap-1">
                            {Array.from({ length: secretWord.length }).map((_, j) => (
                                <div key={j} className="w-7 h-7 rounded-md bg-gray-50 border border-gray-200" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Match Results</h1>
                    <p className="text-gray-500 uppercase tracking-widest text-sm text-[10px] mb-4">Official Wordle Board</p>
                    <div className="flex gap-2 justify-center mt-2">
                        {secretWord.split("").map((char, i) => (
                            <div key={i} className="w-12 h-12 bg-green-500 text-white flex items-center justify-center rounded-lg text-2xl font-bold shadow-lg border-b-4 border-green-700">
                                {char}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myResult && <AttemptGrid person={myResult} />}
                    {otherResults.map((p, i) => (
                        <AttemptGrid key={i} person={p} />
                    ))}
                </div>

                <div className="mt-12 flex justify-center gap-4">
                    <button
                        onClick={() => navigate("/wordle")}
                        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                        <Icons icon="play" className="w-5" />
                        Play Again
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-8 py-3 bg-white text-gray-700 font-bold rounded-xl shadow border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <Icons icon="wrong" className="w-5" />
                        Home
                    </button>
                </div>
            </div>
        </div>
    )
}
