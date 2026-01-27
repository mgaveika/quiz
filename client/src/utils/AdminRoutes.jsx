import { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"

const AdminRoutes = () => {

    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        fetch("/api/auth/isAdmin", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                setIsAdmin(data.data)
                setLoading(false)
            })
    }, [])
    if (loading) return null

    return (isAdmin) ? <Outlet /> : <Navigate to="/login" />
}

export default AdminRoutes