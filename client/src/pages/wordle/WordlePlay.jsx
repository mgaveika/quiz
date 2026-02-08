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
                toast.error(data.message)
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
        <div className="flex flex-col md:flex-row gap-8 p-4 justify-center items-start">
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl font-bold">WORDLE</h1>
                <div className="flex flex-col gap-1">
                    {Array.from({ length: wordleAttempts }).map((_, r) => (
                        <div key={r} className="flex gap-1">
                            {Array.from({ length: wordLength }).map((_, c) => {
                                const letter = r < guesses.length ? guesses[r][c] : (r === guesses.length ? currentGuess[c] : "")
                                const style = r < guesses.length ? evaluateGuess(guesses[r])[c] : "border-gray-300"
                                return (
                                    <div key={c} className={`w-12 h-12 border flex items-center justify-center font-bold text-xl uppercase ${style}`}>
                                        {letter}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-1 mt-4">
                    {isGameOver && <div className="text-blue-600 font-semibold mb-2 animate-pulse">Waiting for other players...</div>}
                    {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, i) => (
                        <div key={i} className="flex gap-1 justify-center">
                            {i === 2 && <button onClick={() => handleKey("ENTER")} className="px-2 py-1 bg-gray-200 rounded font-bold h-10">ENT</button>}
                            {row.split("").map(k => (
                                <button key={k} onClick={() => handleKey(k)} className={`w-8 h-10 rounded font-bold ${getKeyStyle(k)}`}>{k}</button>
                            ))}
                            {i === 2 && <button onClick={() => handleKey("BACKSPACE")} className="px-2 py-1 bg-gray-200 rounded font-bold h-10">DEL</button>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-48">
                {Object.values(opponents).map((opp, i) => (
                    <div key={i} className="mb-4">
                        <div className="text-sm truncate font-medium">{opp.username}</div>
                        <div className="flex flex-col gap-0.5">
                            {Array.from({ length: wordleAttempts || 6 }).map((_, r) => (
                                <div key={r} className="flex gap-0.5">
                                    {Array.from({ length: wordLength || 5 }).map((_, c) => (
                                        <div key={c} className={`w-2 h-2 ${opp.progress[r]?.[c] || "bg-white border"}`} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
