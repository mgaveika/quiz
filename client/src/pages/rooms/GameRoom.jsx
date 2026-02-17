import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navigation from "../../components/Navigation"
import toast from "react-hot-toast"
import Icons from "../../components/Icons"
import Avatar from "../../components/Avatar"

import io from "socket.io-client"

export default function GameRoom() {
    const [roomData, setRoomData] = useState(null)
    const [isCreator, setIsCreator] = useState(false)
    const [participants, setParticipants] = useState([])
    const [settings, setSettings] = useState({})
    const [host, setHost] = useState("")
    const [socket, setSocket] = useState(null)

    const { code } = useParams()
    const navigate = useNavigate()

    const removeParticipant = (username) => {
        if (socket) {
            socket.emit("remove-participant", { code, username })
        }
    }

    const leave = () => {
        if (isCreator) {
            fetch(`/api/gameSession/${code}`, {
                method: "DELETE",
                credentials: 'include'
            }).then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        if (socket) {
                            socket.emit("delete-room", { code })
                            socket.disconnect()
                        }
                        navigate(`/`)
                    } else {
                        toast.error(data.message)
                    }
                })
        } else {
            if (socket) {
                socket.emit("leave-room", { code })
                socket.disconnect()
            }
            navigate(`/`)
        }
    }

    const startGame = () => {
        fetch(`/api/gameSession/${code}/start`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ settings, participants })
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    toast.success(data.message)
                    if (socket) {
                        socket.emit("start-game", { code })
                    }
                } else {
                    toast.error(data.message)
                }
            })
    }

    useEffect(() => {
        const s = io({
            withCredentials: true,
            transports: ["websocket"]
        })
        setSocket(s)

        fetch(`/api/gameSession/${code}`, {
            credentials: 'include'
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    const session = data.data.session
                    if (session.status === "in-progress") {
                        navigate(`/room/${session.roomCode}/live`)
                    } else {
                        setHost(data.data.hostName)
                        setRoomData(session)
                        setSettings(session.gameData?.settings || {})
                        setIsCreator(data.data.isCreator)
                        s.emit("join-room", { code })
                    }
                } else {
                    navigate("/")
                }
            })


        s.on("user-joined", ({ participants }) => {
            setParticipants(participants)
        })

        s.on("user-left", ({ participants }) => {
            setParticipants(participants)
        })

        s.on("start-game", () => {
            navigate(`/room/${code}/live`)
        })

        s.on("room-deleted", () => {
            toast.error("Room has been deleted.")
            navigate("/")
        })

        s.on("settings-updated", ({ settings }) => {
            setSettings(settings)
        })

        s.on("removed-from-room", () => {
            toast.error("You have been kicked out of a room.")
            const backPath = roomData?.gameType === "quiz" ? `/quiz/${roomData.gameData.quizId._id}` : "/wordle"
            navigate(backPath)
        })

        return () => {
            s.emit("leave-room", { code })
            s.disconnect()
            s.off("user-joined")
            s.off("user-left")
            s.off("start-game")
            s.off("room-deleted")
            s.off("settings-updated")
            s.off("removed-from-room")
        }
    }, [])

    const roomTitle = useMemo(() => {
        if (!roomData) return "Game Room"
        if (roomData.gameType === "quiz" && roomData.gameData?.quizId?.title) {
            return roomData.gameData.quizId.title
        }
        return "Game Room"
    }, [roomData])

    return (
        <div className="min-h-screen">
            <Navigation />
            {!roomData ? (
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Entering Room...</p>
                    </div>
                </div>
            ) : (
                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column: Room Info & Participants */}
                        <div className="flex-1 space-y-10">
                            <header className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        {roomData.gameType} Lobby
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                                    {roomTitle}
                                </h1>
                                <p className="text-slate-400 font-medium flex items-center gap-2">
                                    <Icons icon="people" className="w-4 h-4" />
                                    <span>{participants.length} players ready to start</span>
                                </p>
                            </header>

                            {/* Host Card */}
                            <div className="bg-white border-2 border-slate-100 shadow-sm rounded-3xl p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar size="64px" fontSize="24px" name={host} />
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                                            <Icons icon="crown" className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Host</p>
                                        <p className="text-xl font-black text-slate-800 tracking-tight">{host}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Participants Grid */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Participants</h2>
                                </div>
                                <div className="grid bg-white rounded-3xl grid-cols-1 sm:grid-cols-2 gap-4">
                                    {participants.filter(p => p.username !== host).length > 0 ? (
                                        participants.filter(p => p.username !== host).map(p => (
                                            <div key={p.userId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
                                                <Avatar size="48px" fontSize="16px" name={p.username} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-700 truncate">{p.username}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Player</p>
                                                </div>
                                                {isCreator && (
                                                    <button
                                                        onClick={() => removeParticipant(p.username)}
                                                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Icons icon="bin" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 font-medium italic">Waiting for friends to join...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Game Code & Settings */}
                        <div className="w-full lg:w-96 space-y-6">
                            {/* Game Pin Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                                <p className="text-indigo-300 font-black text-xs uppercase tracking-[0.3em] mb-4 relative z-10">Room code</p>
                                <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-4 relative z-10">{roomData.roomCode}</h3>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(roomData.roomCode)
                                    toast.success("Room code copied to clipboard")
                                }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors relative z-10">
                                    <Icons icon="share" className="w-3 h-3" />
                                    <span>Copy Room Code</span>
                                </button>
                            </div>

                            {/* Settings Card */}
                            {isCreator && (
                                <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                            <Icons icon="pen" className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tighter">Room Settings</h3>
                                    </div>

                                    {roomData.gameType === "quiz" && (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Duration (s)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        value={settings.timePerQuestion ?? 30}
                                                        min="1"
                                                        max="120"
                                                        onChange={e => setSettings(prev => ({ ...prev, timePerQuestion: e.target.value }))}
                                                        onBlur={e => {
                                                            let num = Math.min(120, Math.max(1, Math.floor(Number(e.target.value))))
                                                            if (isNaN(num)) num = 30
                                                            const newS = { ...settings, timePerQuestion: num }
                                                            setSettings(newS)
                                                            if (socket) socket.emit("update-settings", { code, settings: newS })
                                                        }}
                                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 transition-all focus:outline-none focus:border-indigo-500 focus:bg-white"
                                                    />
                                                    <Icons icon="clock" className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-focus-within:text-indigo-400" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {roomData.gameType === "wordle" && (
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Word Length</label>
                                                <input
                                                    type="number"
                                                    value={settings.wordLength ?? 5}
                                                    min="3"
                                                    max="10"
                                                    onChange={e => setSettings(prev => ({ ...prev, wordLength: e.target.value }))}
                                                    onBlur={e => {
                                                        let num = Math.min(10, Math.max(3, Math.floor(Number(e.target.value))))
                                                        if (isNaN(num)) num = 5
                                                        const newS = { ...settings, wordLength: num }
                                                        setSettings(newS)
                                                        if (socket) socket.emit("update-settings", { code, settings: newS })
                                                    }}
                                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attempts</label>
                                                <input
                                                    type="number"
                                                    value={settings.wordleAttempts ?? 6}
                                                    min="1"
                                                    max="10"
                                                    onChange={e => setSettings(prev => ({ ...prev, wordleAttempts: e.target.value }))}
                                                    onBlur={e => {
                                                        let num = Math.min(10, Math.max(1, Math.floor(Number(e.target.value))))
                                                        if (isNaN(num)) num = 6
                                                        const newS = { ...settings, wordleAttempts: num }
                                                        setSettings(newS)
                                                        if (socket) socket.emit("update-settings", { code, settings: newS })
                                                    }}
                                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {roomData.gameType === "draw" && (
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rounds</label>
                                                <input
                                                    type="number"
                                                    value={settings.rounds ?? 3}
                                                    min="1"
                                                    max="10"
                                                    onChange={e => setSettings(prev => ({ ...prev, rounds: e.target.value }))}
                                                    onBlur={e => {
                                                        let num = Math.min(10, Math.max(1, Math.floor(Number(e.target.value))))
                                                        if (isNaN(num)) num = 3
                                                        const newS = { ...settings, rounds: num }
                                                        setSettings(newS)
                                                        if (socket) socket.emit("update-settings", { code, settings: newS })
                                                    }}
                                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time per Drawing (s)</label>
                                                <input
                                                    type="number"
                                                    value={settings.timePerRound ?? 60}
                                                    min="30"
                                                    max="180"
                                                    onChange={e => setSettings(prev => ({ ...prev, timePerRound: e.target.value }))}
                                                    onBlur={e => {
                                                        let num = Math.min(180, Math.max(30, Math.floor(Number(e.target.value))))
                                                        if (isNaN(num)) num = 60
                                                        const newS = { ...settings, timePerRound: num }
                                                        setSettings(newS)
                                                        if (socket) socket.emit("update-settings", { code, settings: newS })
                                                    }}
                                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3 pt-4">
                                {isCreator && (
                                    <button
                                        onClick={startGame}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-3"
                                    >
                                        <Icons icon="play" className="w-6 h-6 fill-white" />
                                        <span>Launch Game</span>
                                    </button>
                                )}
                                <button
                                    onClick={leave}
                                    className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-2
                                        ${isCreator ? 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Icons icon="wrong" className="w-5 h-5" />
                                    <span>{isCreator ? "Cancel Room" : "Leave Lobby"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}
