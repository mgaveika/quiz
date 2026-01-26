import { createContext, useState, useEffect } from 'react'

export const userDataContext = createContext(null)

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        fetch('/api/auth/isAuthenticated')
            .then(res => res.json())
            .then(data => setUser(data.data))
    }, [])

    return (
        <userDataContext.Provider value={{ user, setUser }}>
            {children}
        </userDataContext.Provider>
    )
}
