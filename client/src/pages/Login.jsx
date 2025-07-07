import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useCookies } from "react-cookie"

export default function Login() {
    const navigate = useNavigate()
    const [cookie, setCookie] = useCookies(["jwt-auth"])
    async function handleSubmit(event) {
        event.preventDefault()
        const email = event.target.email.value
        const password = event.target.password.value
        fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            }),
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                toast.success(data.message)
            } else if (data.status == "error")  {
                toast.error(data.message)
            } else {
                toast(data.message)
            }
            if (data.data?.token) {
                setCookie("jwt-auth", data.data?.token)
                navigate("/")
            }
        })
    }
    useEffect(() => {
        fetch("/api/auth/isAuthenticated", {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.data?.auth) {
                navigate("/")
            }
        })
    }, [])
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Link to="/"><img src="/quiz.svg" alt="Logo" className="w-14 mb-3"/></Link>
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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