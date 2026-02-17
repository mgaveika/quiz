import { useParams, useNavigate } from "react-router-dom"
import Icons from "../../components/Icons"
import Navigation from "../../components/Navigation"
import { useEffect, useState, useContext } from "react"
import toast from "react-hot-toast"
import { AuthContext } from "../../utils/AuthContext"
import Avatar from "../../components/Avatar"

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
    const maxAttempts = result.maxWordleAttempts || 6

    const results = (result.results || []).map(r => {
        const userId = r.user?._id || r.user || r.guest
        const solved = r.attempts.some(g => g.toUpperCase() === secretWord)
        // Scoring: more points for fewer attempts. 
        // 1st attempt = maxPts, last attempt = 10 pts, fail = 0 pts
        const score = solved ? (maxAttempts - r.attempts.length + 1) * 10 : 0

        return {
            ...r,
            userId: String(userId || ""),
            id: String(userId || ""),
            name: r.username,
            solved,
            score
        }
    }).sort((a, b) => b.score - a.score)

    const processedResults = results.map((r, index) => ({
        ...r,
        rank: index + 1,
        isCurrent: r.userId === String(currentUserId || "")
    }))

    const myResult = processedResults.find(r => r.isCurrent)
    const winners = processedResults.slice(0, 3)
    const getWinner = (rank) => winners.find(w => w.rank === rank)
    const rank1 = getWinner(1)
    const rank2 = getWinner(2)
    const rank3 = getWinner(3)

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
        <div className="min-h-screen font-sans text-slate-900 overflow-x-hidden pb-20">
            <Navigation />
            <div className="max-w-6xl mx-auto p-6 md:p-12">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 mb-4">
                        <Icons icon="trophy" className="w-5 h-5 text-amber-500" />
                        <span className="font-black uppercase tracking-widest text-sm text-slate-500">Wordle Complete</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-2">The Victory Lap</h1>
                    <div className="flex gap-2 justify-center mt-6">
                        {secretWord.split("").map((char, i) => (
                            <div key={i} className="w-12 h-12 md:w-16 md:h-16 bg-white text-slate-800 flex items-center justify-center rounded-2xl text-2xl md:text-4xl font-black shadow-xl border-2 border-slate-100 transform hover:scale-110 transition-transform">
                                {char}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Podium Section - Only show if multiplayer */}
                {processedResults.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-24 h-[400px]">
                        {/* Rank 2 */}
                        <div className="flex flex-col items-center">
                            {rank2 && (
                                <>
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border-2 border-slate-100">
                                        <Avatar size="48px" name={rank2.name} />
                                    </div>
                                    <div className="bg-white rounded-t-[2rem] p-6 w-full text-center border-t border-x border-slate-200 shadow-xl h-48 flex flex-col justify-end">
                                        <span className="text-2xl md:text-3xl font-black text-slate-300 mb-1 leading-none">2nd</span>
                                        <p className="font-bold text-slate-800 text-sm md:text-base truncate">{rank2.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank2.score} PTS</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rank 1 */}
                        <div className="flex flex-col items-center">
                            {rank1 && (
                                <>
                                    <div className="relative mb-6">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">👑</div>
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-white flex items-center justify-center p-1 shadow-2xl shadow-indigo-100 border-4 border-white ring-8 ring-white/50">
                                            <Avatar size="100%" fontSize="40px" name={rank1.name} />
                                        </div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-10 w-full text-center border-t border-x border-white shadow-xl h-64 flex flex-col justify-end">
                                        <span className="text-4xl md:text-6xl font-black text-indigo-600 mb-2 leading-none">1st</span>
                                        <p className="font-black text-slate-900 text-lg md:text-xl truncate">{rank1.name}</p>
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{rank1.score} PTS</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rank 3 */}
                        <div className="flex flex-col items-center">
                            {rank3 && (
                                <>
                                    <div className="w-16 h-16 md:w-16 md:h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                                        <Avatar size="40px" name={rank3.name} />
                                    </div>
                                    <div className="bg-white rounded-t-[2rem] p-6 w-full text-center border-t border-x border-slate-200 shadow-xl h-36 flex flex-col justify-end">
                                        <span className="text-xl md:text-2xl font-black text-slate-200 mb-1 leading-none">3rd</span>
                                        <p className="font-bold text-slate-800 text-xs md:text-sm truncate">{rank3.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank3.score} PTS</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaderboard & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-black tracking-tight">Full Leaderboard</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>
                        <div className="space-y-3">
                            {processedResults.map((player) => (
                                <div key={player.id} className={`flex items-center gap-4 p-5 rounded-3xl bg-white border ${player.isCurrent ? 'border-indigo-200 ring-2 ring-indigo-50 shadow-md' : 'border-slate-100 shadow-sm'} hover:shadow-md transition-shadow`}>
                                    <span className={`w-8 font-black text-lg ${player.rank <= 3 ? 'text-indigo-600' : 'text-slate-300'}`}>#{player.rank}</span>
                                    <Avatar size="40px" name={player.name} />
                                    <span className="flex-1 font-bold text-slate-700">{player.name} {player.isCurrent && <span className="text-[10px] text-indigo-400 ml-2">(You)</span>}</span>
                                    <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                                        <span className="font-black text-slate-800 tabular-nums text-sm">{player.score}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">PTS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center p-12 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

                        <div className="bg-indigo-50 p-4 rounded-3xl mb-6 text-indigo-600">
                            <Icons icon="play" className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4">Game Stats</h2>
                        <div className="grid grid-cols-2 gap-8 w-full">
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Max Attempts</p>
                                <p className="text-4xl font-black text-slate-800">{maxAttempts}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Participants</p>
                                <p className="text-4xl font-black text-slate-800">{processedResults.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Review Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-800">Board Review</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {processedResults.map((p, i) => (
                            <AttemptGrid key={i} person={p} />
                        ))}
                    </div>
                </div>

                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => navigate("/wordle")}
                        className="w-full md:w-auto px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-200 transition-all cursor-pointer flex items-center justify-center gap-3"
                    >
                        <Icons icon="play" className="w-6 h-6" />
                        New Game
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full md:w-auto px-12 py-5 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-3"
                    >
                        <Icons icon="wrong" className="w-6 h-6" />
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    )
}
