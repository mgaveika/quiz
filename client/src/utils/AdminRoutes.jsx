import { useContext } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { AuthContext } from "../utils/AuthContext.jsx"

const AdminRoutes = () => {

    const { isAdmin, loading } = useContext(AuthContext)

    if (loading) return null

    return (isAdmin) ? <Outlet /> : <Navigate to="/login" />
}

export default AdminRoutes