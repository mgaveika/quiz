import { createContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const location = useLocation()


    useEffect(() => {
        fetch('/api/auth/isAuthenticated', {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setUser(data.data)
                    fetch("/api/auth/isAdmin", {
                        credentials: "include"
                    })
                        .then(res => res.json())
                        .then(data => {
                            setIsAdmin(data.data || false)
                            setLoading(false)
                        })
                } else {
                    setUser(null)
                    setLoading(false)
                }
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
                    setIsAdmin(false)
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
