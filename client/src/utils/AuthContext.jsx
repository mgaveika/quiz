import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

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
    }, [])

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
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
