import { useEffect, useState } from "react";
import Navigation from "./Navigation.jsx";
export default function Home() {
    const [auth, setAuth] = useState({ loading: true, isAuthenticated: false, user: null });

    function logout() {
        localStorage.removeItem("token");
        setAuth({ loading: false, isAuthenticated: false, user: null });
    }
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setAuth({ loading: false, isAuthenticated: false, user: null });
            return;
        }
        fetch("http://localhost:3000/api/auth/isAuthenticated", {
            headers: { "x-access-token": token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.auth) {
                    setAuth({ loading: false, isAuthenticated: true, user: data.user });
                } else {
                    logout()
                }
            })
            .catch(() => setAuth({ loading: false, isAuthenticated: false, user: null }));
    }, []);
    return (
        <main className="bg-gray-100 min-h-screen">
            <Navigation auth={auth} logout={logout}/>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">{auth.isAuthenticated ? `Hello, ${auth.user.username}` : "Welcome, guest!"}</h1>
            </div>
        </main>
    );
}