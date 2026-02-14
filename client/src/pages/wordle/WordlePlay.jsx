import { useEffect, useState, useContext } from "react"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../../utils/AuthContext"

export default function WordleGame({ gameData, socket }) {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const { code } = useParams()

    const [attemptId, setAttemptId] = useState(null)
    const [guesses, setGuesses] = useState([])
    const [currentGuess, setCurrentGuess] = useState("")
    const [isGameOver, setIsGameOver] = useState(false)
    const [loading, setLoading] = useState(true)
    const [opponents, setOpponents] = useState({})

    const gameDataInfo = gameData?.session?.gameData || {}
    const settings = gameDataInfo.settings || { wordLength: 5, wordleAttempts: 6 }
    const secretWord = (gameDataInfo.word || "").toUpperCase()
    const { wordLength, wordleAttempts } = settings
    const currentUserId = gameData?.userId || user?.user?.id || user?.user?._id || user?.id || user?._id
    const currentUsername = gameData?.session?.participants?.find(p => (p.user || p.guest) === currentUserId)?.username

    const evaluateGuess = (guess) => {
        return guess.split("").map((letter, i) => {
            if (letter === secretWord[i]) return "bg-green-500 text-white"
            if (secretWord.includes(letter)) return "bg-yellow-500 text-white"
            return "bg-gray-500 text-white"
        })
    }

    const syncProgress = (newGuesses, finished) => {
        const progress = newGuesses.map(g => evaluateGuess(g))
        if (socket) socket.emit('game-progress', { code, userId: currentUserId, username: currentUsername, progress })

        fetch(`/api/gameAttempt/${attemptId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ attempts: newGuesses, finished })
        }).then(res => res.json()).then(data => {
            if (data.status !== "error" && finished) {
                toast.success(data.message)
            }
        })
    }

    const handleKey = (key) => {
        if (isGameOver || loading || !attemptId) return
        if (key === "ENTER") {
            if (currentGuess.length !== wordLength) return toast.error("Too short")
            const newGuesses = [...guesses, currentGuess.toUpperCase()]
            const finished = currentGuess.toUpperCase() === secretWord || newGuesses.length >= wordleAttempts
            setGuesses(newGuesses)
            setCurrentGuess("")
            if (finished) setIsGameOver(true)
            syncProgress(newGuesses, finished)
        } else if (key === "BACKSPACE") {
            setCurrentGuess(prev => prev.slice(0, -1))
        } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
            setCurrentGuess(prev => prev + key)
        }
    }

    useEffect(() => {
        fetch(`/api/gameAttempt?sessionId=${gameData.session._id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.data) {
                    setAttemptId(data.data._id)
                    const me = data.data.results.find(r => String(r.user || r.guest) === String(currentUserId))
                    if (me) {
                        setGuesses(me.attempts || [])
                        if (me.finished) setIsGameOver(true)
                    }
                    const ops = {}
                    data.data.results.forEach(r => {
                        const id = r.user || r.guest
                        if (id && String(id) !== String(currentUserId)) {
                            ops[id] = { username: r.username, progress: (r.attempts || []).map(g => evaluateGuess(g)) }
                        }
                    })
                    setOpponents(ops)
                }
                setLoading(false)
            })
    }, [gameData.session._id])

    useEffect(() => {
        if (!socket) return
        socket.on('game-progress', ({ userId, username, progress }) => {
            if (userId !== currentUserId) setOpponents(prev => ({ ...prev, [userId]: { username, progress } }))
        })
        socket.on('game-finished', ({ attemptId: aid }) => {
            const finalId = aid || attemptId
            if (finalId) setTimeout(() => navigate(`/wordle/result/${finalId}`), 1000)
        })
        return () => {
            socket.off('game-progress')
            socket.off('game-finished')
        }
    }, [socket, attemptId, navigate])

    useEffect(() => {
        const onDown = (e) => handleKey(e.key.toUpperCase())
        window.addEventListener("keydown", onDown)
        return () => window.removeEventListener("keydown", onDown)
    }, [currentGuess, isGameOver, loading])

    const getKeyStyle = (key) => {
        let status = "bg-gray-200"
        guesses.forEach(guess => {
            guess.split("").forEach((letter, i) => {
                if (letter === key) {
                    if (letter === secretWord[i]) status = "bg-green-500 text-white"
                    else if (secretWord.includes(letter) && status !== "bg-green-500 text-white") status = "bg-yellow-500 text-white"
                    else if (status === "bg-gray-200") status = "bg-gray-400 text-white"
                }
            })
        })
        return status
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <main className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center py-12 px-4 select-none">
            {/* Game Container */}
            <div className="w-full max-w-lg flex flex-col items-center gap-10">

                {/* Header / Info */}
                <div className="text-center space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">WORDLE</h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <span className="px-2 py-0.5 border border-slate-100 rounded-md bg-slate-50">{wordLength} Letters</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 border border-slate-100 rounded-md bg-slate-50">{wordleAttempts} Attempts</span>
                    </div>
                </div>

                {/* The Board */}
                <div className="flex flex-col gap-2">
                    {Array.from({ length: wordleAttempts }).map((_, r) => (
                        <div key={r} className="flex gap-2">
                            {Array.from({ length: wordLength }).map((_, c) => {
                                const letter = r < guesses.length ? guesses[r][c] : (r === guesses.length ? currentGuess[c] : "")
                                const evaluationStyle = r < guesses.length ? evaluateGuess(guesses[r])[c] : ""
                                const isCurrent = r === guesses.length
                                const isFilled = !!letter

                                return (
                                    <div
                                        key={c}
                                        className={`
                                            w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black rounded-2xl border-2 transition-all duration-300
                                            ${evaluationStyle || (isFilled ? "border-slate-400 text-slate-800 scale-[1.05] shadow-sm" : "border-slate-100 text-slate-300")}
                                            ${!evaluationStyle && isCurrent && !letter ? "bg-slate-50/50" : ""}
                                        `}
                                    >
                                        {letter}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Status & Feedback */}
                <div className="min-h-[24px]">
                    {isGameOver && (
                        <div className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-xs uppercase tracking-widest animate-pulse border border-indigo-100">
                            Waiting for results...
                        </div>
                    )}
                </div>

                {/* Keyboard */}
                <div className="w-full flex flex-col gap-2 px-2">
                    {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, i) => (
                        <div key={i} className="flex gap-1.5 justify-center">
                            {i === 2 && (
                                <button
                                    onClick={() => handleKey("ENTER")}
                                    className="h-14 px-3 md:px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-200/50"
                                >
                                    ENTER
                                </button>
                            )}
                            {row.split("").map(k => (
                                <button
                                    key={k}
                                    onClick={() => handleKey(k)}
                                    className={`
                                        w-8 md:w-10 h-14 rounded-xl font-black text-sm transition-all active:scale-95 border border-transparent shadow-sm
                                        ${getKeyStyle(k).includes("bg-gray-200") ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200/50" : getKeyStyle(k)}
                                    `}
                                >
                                    {k}
                                </button>
                            ))}
                            {i === 2 && (
                                <button
                                    onClick={() => handleKey("BACKSPACE")}
                                    className="h-14 px-3 md:px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-200/50"
                                >
                                    DEL
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Integrated Opponents Progress */}
                {Object.values(opponents).length > 0 && (
                    <div className="w-full pt-12 border-t border-slate-100">
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Live Opponents</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {Object.values(opponents).map((opp, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group">
                                    <div className="flex flex-col gap-1 items-center">
                                        {Array.from({ length: wordleAttempts }).map((_, r) => (
                                            <div key={r} className="flex gap-1">
                                                {Array.from({ length: wordLength }).map((_, c) => (
                                                    <div
                                                        key={c}
                                                        className={`w-2 h-2 rounded-[2px] ${opp.progress[r]?.[c] || "bg-slate-50 border border-slate-100"}`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 truncate max-w-[80px] group-hover:text-slate-900 transition-colors uppercase tracking-tighter">{opp.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
