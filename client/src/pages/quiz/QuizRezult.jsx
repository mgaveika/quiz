import { useParams, useNavigate } from "react-router-dom"
import Icons from "../../components/Icons"
import Navigation from "../../components/Navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Avatar from "../../components/Avatar"

export default function QuizRezult() {
    const { attemptId } = useParams()
    const [result, setResult] = useState(null)
    const [stars, setStars] = useState({ sum: -1, saved: -1 })

    const handleRate = (rating) => {
        setStars(prev => ({ ...prev, saved: rating }))

        fetch(`/api/gameAttempt/${attemptId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating: rating + 1
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success("Rating saved!")
                } else {
                    toast.error(data.message)
                }
            })
    }

    const navigate = useNavigate()
    useEffect(() => {
        fetch(`/api/gameAttempt/id/${attemptId}`, {
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    setResult(data.data)
                    const dbRating = data.data.attempt.rating
                    const uiRating = dbRating > 0 ? dbRating - 1 : -1
                    setStars((prev) => ({ ...prev, saved: uiRating }))
                } else {
                    toast.error(data.message)
                    navigate("/quiz")
                }
            })
    }, [])

    if (result === null) {
        return (
            <>
                <Navigation />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </>
        )
    }

    const scorePercentage = (result.attempt.score / result.questions.length) * 100

    const getScoreBgColor = () => {
        if (scorePercentage >= 80) return 'from-green-500 to-green-600'
        if (scorePercentage >= 60) return 'from-yellow-500 to-yellow-600'
        return 'from-red-500 to-red-600'
    }

    const leaderboard = result.leaderboard || []
    const sortedLeaderboard = leaderboard.map((p, index) => ({
        ...p,
        rank: index + 1
    }))

    const winners = sortedLeaderboard.slice(0, 3)
    const getWinner = (rank) => winners.find(w => w.rank === rank)
    const rank1 = getWinner(1)
    const rank2 = getWinner(2)
    const rank3 = getWinner(3)

    return (
        <div className="min-h-screen font-sans text-slate-900 overflow-x-hidden pb-20">
            <Navigation />
            <div className="max-w-6xl mx-auto p-6 md:p-12">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 mb-4">
                        <Icons icon="trophy" className="w-5 h-5 text-amber-500" />
                        <span className="font-black uppercase tracking-widest text-sm text-slate-500">Quiz Completed</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-2">The Victory Lap</h1>
                    <p className="text-xl font-medium text-slate-400 italic">Who mastered the knowledge?</p>
                </div>

                {/* Podium Section - Only show if multiplayer */}
                {leaderboard.length > 1 && (
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

                {/* Scoreboard List & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                    {/* Leaderboard Column */}
                    {leaderboard.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-2xl font-black tracking-tight">Full Leaderboard</h2>
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </div>
                            <div className="space-y-3">
                                {sortedLeaderboard.map((player) => (
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
                    )}

                    {/* Stats & Current User Summary */}
                    <div className="space-y-8">
                        {/* Premium Stats Card */}
                        <div className="flex flex-col justify-center items-center p-12 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl text-center relative overflow-hidden group">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

                            <div className="bg-indigo-50 p-4 rounded-3xl mb-6 text-indigo-600">
                                <Icons icon="quiz" className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4">Game Stats</h2>
                            <div className="grid grid-cols-2 gap-8 w-full">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Questions</p>
                                    <p className="text-4xl font-black text-slate-800">{result.questions.length}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Participants</p>
                                    <p className="text-4xl font-black text-slate-800">{leaderboard.length || 1}</p>
                                </div>
                            </div>
                        </div>

                        {/* Current User Score Summary (Original UI parts integrated) */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-lg space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{result.quiz.title}</h3>
                                    <p className="text-sm font-bold text-slate-400">Your Score Summary</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-indigo-600">{result.attempt.score} / {result.questions.length}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Answers</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <span>Success Rate</span>
                                    <span>{Math.round(scorePercentage)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getScoreBgColor()} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${scorePercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rate this quiz</p>
                                <div className="flex gap-2">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <button
                                            key={i}
                                            className="transition-transform hover:scale-125 active:scale-90"
                                            onClick={() => handleRate(i)}
                                            onMouseEnter={() => setStars(prev => ({ ...prev, sum: i }))}
                                            onMouseLeave={() => setStars(prev => ({ ...prev, sum: -1 }))}
                                        >
                                            <Icons
                                                className={`w-8 h-8 transition-colors ${(i <= stars.sum || i <= stars.saved) ? "text-amber-400" : "text-slate-200"}`}
                                                icon="star"
                                            />
                                        </button>
                                    ))}
                                </div>
                                {stars.saved >= 0 && (
                                    <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-wide">Thank you for rating!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Results Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-800">Knowledge Review</h2>
                    </div>

                    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                        {result.questions.map((question, qid) => {
                            const answerObj = result.attempt.answers.find(a => String(a.questionId) === String(question._id))
                            const userAnswer = answerObj ? answerObj.answer : null

                            // Determine if answer is correct
                            let isQuestionCorrect = false
                            if (question.answerType === "single") {
                                if (typeof userAnswer === 'number') {
                                    isQuestionCorrect = question.options[userAnswer]?.correctAnswer || false
                                } else if (Array.isArray(userAnswer) && userAnswer.length === 1) {
                                    isQuestionCorrect = question.options[userAnswer[0]]?.correctAnswer || false
                                }
                            } else if (question.answerType === "multi") {
                                if (Array.isArray(userAnswer)) {
                                    const correctIndices = question.options
                                        .map((opt, idx) => opt.correctAnswer ? idx : null)
                                        .filter(idx => idx !== null)

                                    isQuestionCorrect = correctIndices.length === userAnswer.length &&
                                        correctIndices.every(idx => userAnswer.includes(idx)) &&
                                        userAnswer.every(idx => correctIndices.includes(idx))
                                }
                            }

                            return (
                                <div key={qid} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full">
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isQuestionCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {isQuestionCorrect ? 'Correct' : 'Mistake'}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Q{qid + 1}</span>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-800 mb-8 leading-tight">{question.questionText}</h3>

                                        <div className="space-y-3 mt-auto">
                                            {question.options.map((option, oid) => {
                                                const isUserAnswer = Array.isArray(userAnswer) && userAnswer.includes(oid)
                                                const isCorrect = option.correctAnswer

                                                let statusStyle = "border-slate-50 bg-slate-50 opacity-60"
                                                let icon = null

                                                if (isUserAnswer && isCorrect) {
                                                    statusStyle = "border-emerald-200 bg-emerald-50/50 opacity-100 ring-2 ring-emerald-100"
                                                    icon = "check"
                                                } else if (isUserAnswer && !isCorrect) {
                                                    statusStyle = "border-rose-200 bg-rose-50/50 opacity-100 shadow-sm"
                                                    icon = "wrong"
                                                } else if (!isUserAnswer && isCorrect) {
                                                    statusStyle = "border-emerald-200 bg-white opacity-100"
                                                    icon = "check"
                                                }

                                                return (
                                                    <div key={oid} className={`flex items-center gap-3 p-4 border-2 rounded-2xl transition-all ${statusStyle}`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${icon === 'check' ? 'bg-emerald-500' : icon === 'wrong' ? 'bg-rose-500' : 'bg-slate-200'} text-white`}>
                                                            {icon && <Icons icon={icon} className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{option.option}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-200 transition-all cursor-pointer flex items-center justify-center gap-3"
                    >
                        <Icons icon="play" className="w-6 h-6" />
                        Explore More Quizzes
                    </button>
                </div>
            </div>
        </div>
    )
}