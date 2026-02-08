import { createContext, useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const location = useLocation()

    const isAdmin = useMemo(() => {
        return user?.user?.role === "admin"
    }, [user])

    useEffect(() => {
        fetch('/api/auth/isAuthenticated', {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setUser(data.data)
                } else {
                    setUser(null)
                }
                setLoading(false)
            })
            .catch(() => {
                setUser(null)
                setLoading(false)
            })
    }, [location.pathname])

    function logout() {
        setLoading(true)
        fetch("/api/auth/logout", {
            method: "POST",
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setUser(null)
                }
                setLoading(false)
            })
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}
