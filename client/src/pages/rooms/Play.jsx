import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import QuizPlay from '../quiz/QuizPlay.jsx'
import WordlePlay from '../wordle/WordlePlay.jsx'
import Navigation from '../../components/Navigation.jsx'
import io from "socket.io-client"

let socket

export default function Play() {
    const [sessionData, setSessionData] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { code } = useParams()

    useEffect(() => {
        socket = io({
            withCredentials: true,
            transports: ["websocket"]
        })

        socket.emit("join-room", { code })

        fetch(`/api/gameSession/${code}`, {
            credentials: 'include'
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    if (data.data.session.status === "waiting") {
                        navigate(`/room/${code}`)
                    }
                    setSessionData(data.data)
                    setLoading(false)
                } else {
                    toast.error(data.message)
                    navigate("/")
                }
            })

        return () => {
            if (socket) socket.disconnect()
        }
    }, [code, navigate])

    return (
        <>
            <Navigation />
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                sessionData.session.gameType === "quiz" ? (
                    <QuizPlay gameData={sessionData} socket={socket} />
                ) : (
                    <WordlePlay gameData={sessionData} socket={socket} />
                )
            )}
        </>
    )
}
