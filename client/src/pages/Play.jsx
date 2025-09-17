import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"

export default function Play() {
    const [sessionData, setSessionData] = useState(null)
    const {code} = useParams()
    const navigate = useNavigate()
    useEffect(() => {
        fetch(`/api/room/${code}/session`, {
            credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setSessionData(data.data)
                console.log(data.data)
            } else {
                toast.error(data.message)
                navigate("/list")
            }
        })
    }, [])
    return (
        <>
            <Navigation />
            {!sessionData ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="text-gray-700">
                    <p>{code}</p>
                </div>
            )}
        </>
    )
}