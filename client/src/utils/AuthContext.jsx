import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        fetch('/api/auth/isAuthenticated')
            .then(res => res.json())
            .then(data => setUser(data.data))
    }, [])

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}
