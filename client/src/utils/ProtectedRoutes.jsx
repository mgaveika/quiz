import { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"

const ProtectedRoutes = () => {
    const [validated, setValid] = useState(null)

    useEffect(() => {
        fetch("/api/auth/isAuthenticated", {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            setValid(data.data?.auth)
        })
    }, [])

    if (validated === null) return null
    return validated ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes