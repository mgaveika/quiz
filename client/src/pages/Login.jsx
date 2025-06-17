import { useState, useEffect } from "react"
import { Link } from "react-router"

export default function Login() {
    const [errorMsg, setErrorMsg] = useState([])
    async function handleSubmit(event) {
        event.preventDefault()
        const email = event.target.email.value
        const password = event.target.password.value
        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            })
            const data = await response.json()
            setErrorMsg(data)
            if (data.token) {
                localStorage.setItem("token", data.token)
                window.location.href = "/"
            }
        } catch (error) {
            setErrorMsg({msg: 'Error: '+ error.message, msgType: 'error'})
        }
    }
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            fetch("http://localhost:3000/api/auth/isAuthenticated", {
                headers: { "x-access-token": token }
            })
            .then(res => res.json())
            .then(data => {
                if (data.auth) {
                    window.location.href = "/"
                }
                })
        }
    }, [])
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Link to="/"><img src="/quiz.svg" alt="Logo" className="w-14 mb-3"/></Link>
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {errorMsg && <div className={`${errorMsg.msgType === "error" ? "text-red-500" : "text-green-500"} text-center mb-4`}>{errorMsg.msg}</div>}
                <form onSubmit={handleSubmit} method='post'>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-3">
                    <span className="text-gray-500">Don't have an account?</span>
                    <Link to="/register" className="ml-2 text-blue-500">Sign up</Link>
                </div>
            </div>
        </div>
    )
}