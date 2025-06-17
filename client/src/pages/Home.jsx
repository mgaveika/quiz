import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
export default function Home() {
    const [auth, setAuth] = useState({ loading: true, isAuthenticated: false, user: null })

    function logout() {
        localStorage.removeItem("token")
        setAuth({ loading: false, isAuthenticated: false, user: null })
        window.location.href = "/"
    }
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setAuth({ loading: false, isAuthenticated: false, user: null })
            return
        }
        fetch("http://localhost:3000/api/auth/isAuthenticated", {
            headers: { "x-access-token": token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.auth) {
                    setAuth({ loading: false, isAuthenticated: true, user: data.user })
                } else {
                    logout()
                }
            })
            .catch(() => setAuth({ loading: false, isAuthenticated: false, user: null }))
    }, [])
    return (
        <main className="min-h-screen">
            {auth.loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : <> 
                <Navigation auth={auth} logout={logout}/>
                <div className="container mx-auto p-8">
                    <h1 className="text-2xl font-bold">{auth.isAuthenticated ? `Hello, ${auth.user.username}` : "Welcome, guest!"}</h1>
                </div> 
            </>}
        </main>
    )
}