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
    const [settings, setSettings] = useState({timePerQuestion: 30, allowSpectators: false, privateRoom: false})

    const {code} = useParams()
    const navigate = useNavigate()

    const removeParticipant = (username) => {
        if (socket) {
            socket.emit("remove-participant", { code, username });
        }
    }

    const leave = () => {
        if (socket) {
            socket.emit("leave-room", {code})
            socket.disconnect()
        }
        navigate(`/quiz/${roomData.room.quizId}`)
    }

    const startGame = () => {
        let newParticipantsArr = participants.map(p => ({ user: p.userId }))
        console.log(newParticipantsArr)
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
                navigate(`/room/${code}/live`)
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


        socket.on("user-joined", ({participants}) => {
            setParticipants(participants)
        })

        socket.on("user-left", ({participants}) => {
            setParticipants(participants)
        })

        socket.on("removed-from-room", () => {
            toast.error("You have been kicked out of a room.")
            navigate(`/quiz/${roomData.room.quizId}`)
        });

        return () => {
            if (socket) {
                socket.emit("leave-room", {code})
                socket.disconnect()
                socket.off("user-joined")
                socket.off("user-left")
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
                <div className="text-gray-700">
                    <div className="flex bg-white rounded shadow-sm text-xl font-bold w-fit mx-auto mt-5 px-5 py-3">
                        <Icons icon="share" className="w-10"/>
                        <div className="ml-3">
                            <h2 className="text-sm">Game Pin:</h2>
                            <p className="text-5xl">{roomData.room.code}</p>
                        </div>
                    </div>
                    {isCreator && 
                        <div className="bg-white shadow-sm rounded p-5 w-fit mx-auto mt-2 flex flex-col justify-center">
                            <div className="flex flex-col justify-center">
                                <label htmlFor="time-limit" className="block mb-2 text-center">Seconds per question</label>
                                <input
                                    id="time-limit"
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={settings.timePerQuestion}
                                    onChange={e => setSettings(prev => ({...prev, timePerQuestion: e.target.value}))}
                                    onBlur={e => {
                                        let num = Number(e.target.value)
                                        num = Math.floor(num)
                                        if (num > e.target.max) num = e.target.max
                                        if (num < e.target.min || isNaN(num)) num = 1
                                        setSettings(prev => ({...prev, timePerQuestion: num}))
                                    }}
                                    className="mx-auto border-1 border-gray-400 rounded px-2 py-1 w-20 mb-2"
                                />
                            </div>
                            <label htmlFor="spectators" className=" mx-auto flex gap-2 mt-2">
                                <input
                                    id="spectators"
                                    name="spectators"
                                    type="checkbox"
                                    checked={!!settings.spectators}
                                    onChange={e => setSettings(prev => ({...prev, spectators: e.target.checked}))}
                                />
                                Allow spectators
                            </label>
                        </div>
                    }
                    <div className="w-fit mx-auto p-3 bg-white shadow-sm rounded mt-3 flex flex-col">
                        <p className="text-center font-semibold mb-2">Host</p>
                        <div key={roomData.hostUsername} className="flex flex-col gap-1 px-7 py-1 shadow-sm rounded w-fit">
                            <Avatar size="30px" fontSize="15px" name={roomData.hostUsername} />
                            <p className="font-semibold">{roomData.hostUsername}</p>
                        </div>
                    </div>
                    <div className="w-fit max-w-200 mx-auto p-3 bg-white shadow-sm rounded mt-3 flex flex-col justify-center">
                        <p className="text-center font-semibold mb-2">Participants</p>
                        <div className="flex gap-2">
                            {participants.map(p => (
                                <div key={p.userId} className="flex gap-1 px-3 py-2 bg-white shadow-sm border-1 border-gray-200 rounded w-fit">
                                    <Avatar size="30px" fontSize="15px" name={p.username} />
                                    <p>{p.username}</p>
                                    {isCreator && <button
                                        type="button"
                                        onClick={() => removeParticipant(p)}
                                        className="ml-2 text-red-500 hover:text-red-700 w-5 cursor-pointer h-full"
                                    >
                                        <Icons icon="bin" className="w-5 my-auto"/>
                                    </button>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full flex flex-col justify-center mt-5 gap-2">
                        {isCreator && 
                            <button onClick={startGame} className="w-fit mx-auto text-white bg-green-700 rounded px-8 py-2">Start game</button>
                        }
                        <button onClick={leave} className="w-fit mx-auto text-white bg-red-700 rounded px-3 py-1">{isCreator ? "Delete room" : "Leave room"}</button>
                    </div>
                </div>
            )}
        </>
    )
}