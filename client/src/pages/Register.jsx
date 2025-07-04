import { useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useCookies } from "react-cookie"

export default function Register() {
    const [cookies] = useCookies(["jwt-auth"])
    const navigate = useNavigate()
    async function handleSubmit(event) {
        event.preventDefault()
        const email = event.target.email.value
        const username = event.target.username.value
        const password = event.target.password.value
        const confirmPassword = event.target.confirmPassword.value
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    confirmPassword
                }),
            })
            const data = await response.json()
            if (data.status == "success") {
                toast.success(data.message)
                navigate("/login")
            } else if (data.status == "error")  {
                toast.error(data.message)
            } else {
                toast(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }
    useEffect(() => {
        if (cookies["jwt-auth"]) {
            fetch("/api/auth/isAuthenticated", {
                headers: { "x-access-token": cookies["jwt-auth"] }
            })
            .then(res => res.json())
            .then(data => {
                if (data.data?.auth) {
                    navigate("/")
                }
            })
        }
    }, [])
    return (
         <div className="flex flex-col items-center justify-center min-h-screen">
            <Link to="/"><img src="/quiz.svg" alt="Logo" className="w-14 mb-3"/></Link>
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                <form onSubmit={handleSubmit} method='post'>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                        <input type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Choose a username"
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Register
                    </button>
                </form>
                <div className="mt-3">
                    <span className="text-gray-500">Already have an account?</span>
                    <Link to="/login" className="ml-2 text-blue-500">Sign in</Link>
                </div>
            </div>
        </div>
    )
}