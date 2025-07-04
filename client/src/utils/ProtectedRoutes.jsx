import { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useCookies } from "react-cookie"

const ProtectedRoutes = () => {
    const [validated, setValid] = useState(false)
    const [loading, setLoading] = useState(true)
    const [cookies] = useCookies(["jwt-auth"])

    useEffect(() => {
        if (cookies["jwt-auth"]) {
            fetch("/api/auth/isAuthenticated", {
                headers: { "x-access-token": cookies["jwt-auth"] }
            })
            .then(res => res.json())
            .then(data => {
                if (data.data?.auth) {
                    setValid(true)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [cookies])

    if (loading) {
        return null
    }

    return validated ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes