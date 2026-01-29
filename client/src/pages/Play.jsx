import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import QuizPlay from './quiz/QuizPlay.jsx'
import WordlePlay from './wordle/WordlePlay.jsx'

export default function Play() {
    const [sessionData, setSessionData] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { code } = useParams()
    useEffect(() => {
        fetch(`/api/room/${code}/session`, {
            credentials: 'include'
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    setSessionData(data.data)
                    setLoading(false)
                } else {
                    toast.error(data.message)
                    navigate("/")
                }
            })
    }, [])
    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                sessionData.session.gameType === "quiz" ? (
                    <QuizPlay gameData={sessionData} />
                ) : (
                    <WordlePlay gameData={sessionData} />
                )
            )}
        </>
    )
}