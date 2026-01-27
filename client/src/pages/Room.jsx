import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"
import Icons from "../components/Icons"
import Avatar from "../components/Avatar"

import io from "socket.io-client"

let socket

export default function Room() {
    const [roomData, setRoomData] = useState(null)
    const [isCreator, setIsCreator] = useState(false)
    const [participants, setParticipants] = useState([])
    const [settings, setSettings] = useState({ timePerQuestion: 30, allowSpectators: false, privateRoom: false })

    const { code } = useParams()
    const navigate = useNavigate()

    const removeParticipant = (username) => {
        if (socket) {
            socket.emit("remove-participant", { code, username });
        }
    }

    const leave = () => {
        if (socket) {
            socket.emit("leave-room", { code })
            socket.disconnect()
        }
        navigate(`/list`)
    }

    const startGame = () => {
        let newParticipantsArr = participants.map(p => ({ user: p.userId }))
        fetch(`/api/room/${code}/start`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ settings, participants: newParticipantsArr })
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success(data.message)
                    // Notify all participants that game has started
                    if (socket) {
                        socket.emit("start-game", { code })
                    }
                    //navigate(`/room/${code}/live`)
                } else {
                    toast.error(data.message)
                    navigate("/list")
                }
            })
    }

    useEffect(() => {
        socket = io.connect("ws://localhost:8080", {
            withCredentials: true,
            transports: ["websocket"]
        })

        fetch(`/api/room/${code}`, {
            credentials: 'include'
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    if (data.data.data.active) {
                        navigate(`/room/${data.data.data.room.code}/live`)
                    } else {
                        setIsCreator(data.data.creator)
                        setRoomData(data.data.data)
                        socket.emit("join-room", { code })
                    }
                } else {
                    toast.error(data.message)
                    navigate("/list")
                }
            })


        socket.on("user-joined", ({ participants }) => {
            setParticipants(participants)
        })

        socket.on("user-left", ({ participants }) => {
            setParticipants(participants)
        })

        socket.on("start-game", () => {
            navigate(`/room/${code}/live`)
        })

        socket.on("removed-from-room", () => {
            toast.error("You have been kicked out of a room.")
            navigate(`/quiz/${roomData.room.quizId}`)
        });

        return () => {
            if (socket) {
                socket.emit("leave-room", { code })
                socket.disconnect()
                socket.off("user-joined")
                socket.off("user-left")
                socket.off("start-game")
                socket.off("removed-from-room")
            }
        }
    }, [])

    return (
        <>
            <Navigation />
            {!roomData ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="text-gray-700 shadow-md max-w-3xl mx-auto mt-2">
                    <div className="flex justify-between items-center bg-purple-600 px-5 py-2 rounded-t-md">
                        <div className="h-fit w-fit">
                            <h1 className="text-2xl font-bold text-white">Quiz Room</h1>
                            <div className="flex items-center gap-2">
                                <Icons icon="people" className="w-4 text-white" />
                                <h2 className="text-lg text-white">{participants.length} participants waiting</h2>
                            </div>
                        </div>
                        <div className="flex bg-purple-700 rounded shadow-sm text-xl font-bold border border-purple-800 w-fit px-5 py-3">
                            <Icons icon="share" className="w-6 text-white" />
                            <div className="ml-3 text-white">
                                <h2 className="text-sm">Game Pin:</h2>
                                <p className="text-3xl">{roomData.room.code}</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full p-3 bg-white">
                        {isCreator &&
                            <div className="bg-gray-100 border border-gray-200 hover:border-gray-300 rounded p-5 w-full mx-auto mt-2 flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <Icons icon="clock" className="w-6 text-purple-600" />
                                    <label htmlFor="time-limit" className="block mb-2 font-bold mt-1">Question duration</label>
                                </div>
                                <input
                                    id="time-limit"
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={settings.timePerQuestion}
                                    onChange={e => setSettings(prev => ({ ...prev, timePerQuestion: e.target.value }))}
                                    onBlur={e => {
                                        let num = Number(e.target.value)
                                        num = Math.floor(num)
                                        if (num > e.target.max) num = e.target.max
                                        if (num < e.target.min || isNaN(num)) num = 1
                                        setSettings(prev => ({ ...prev, timePerQuestion: num }))
                                    }}
                                    className=" bg-white mx-auto border-1 border-gray-400 rounded px-2 py-3 font-semibold w-full mb-2 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                />
                                <p className="text-center text-sm text-gray-500">Set the time limit for each question</p>
                            </div>
                        }
                        <div className="w-full p-4 bg-gray-100 border border-gray-200 hover:border-gray-300 shadow-sm rounded mt-3">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar size="60px" fontSize="25px" name={roomData.hostUsername} />
                                    <div className="absolute right-0 top-0 w-5 h-5 rounded-full bg-purple-500 flex justify-center">
                                        <Icons icon="crown" className="w-4 text-white" />
                                    </div>
                                </div>
                                <div className="">
                                    <p className="text-sm text-gray-500 bg-purple-200 text-gray-600 font-semibold px-2 py-1 rounded-full w-fit">Quiz Host</p>
                                    <p className="text-xl font-semibold ">{roomData.hostUsername}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-200 shadow-sm rounded mt-3">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold mb-2">Participants</p>
                                <p className="text-sm text-gray-500">{participants.length} players</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {participants.map(p =>
                                    <>
                                        {p.username !== roomData.hostUsername &&
                                            <div key={p.userId} className="flex items-center gap-2 bg-gray-50 rounded-lg p-4 transition-all duration-200 border border-gray-200 hover:border-gray-300">
                                                <Avatar size="50px" fontSize="15px" name={p.username} />
                                                <p className="text-clip overflow-hidden flex-1">{p.username}</p>
                                                {isCreator && <button
                                                    type="button"
                                                    onClick={() => removeParticipant(p)}
                                                    className="ml-2 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700 p-1 rounded-md cursor-pointer"
                                                >
                                                    <Icons icon="bin" className="w-5 my-auto" />
                                                </button>}
                                            </div>}
                                    </>
                                )}
                            </div>
                            <div className="w-full flex mt-5 gap-2">
                                {isCreator &&
                                    <button onClick={startGame} className="flex-1 text-white bg-green-700 rounded px-8 py-2">Start game</button>
                                }
                                <button onClick={leave} className="flex-1 text-white bg-red-700 rounded px-3 py-1">{isCreator ? "Delete room" : "Leave room"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}