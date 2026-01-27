import { useContext } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { AuthContext } from "../utils/AuthContext.jsx"

const ProtectedRoutes = () => {
    const { user, loading } = useContext(AuthContext)

    if (loading) return null
    return (user && user.auth) ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes