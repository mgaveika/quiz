import { useState, useEffect, useContext } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { AuthContext } from "../utils/AuthContext.jsx"

const ProtectedRoutes = () => {
    const { user } = useContext(AuthContext)

    if (!user || !user.auth) return <Navigate to="/login" />
    return <Outlet />
}

export default ProtectedRoutes