import { useState, useContext, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import { AuthContext } from '../../utils/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const { user, loading } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (user && user.auth) {
            navigate("/")
        }
    }, [user])

    const handleCodeSubmit = (e) => {
        e.preventDefault()
        fetch("/api/auth/forgotPassword", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    navigate(`/forgot-password/${data.data}`)
                } else {
                    toast.error(data.message)
                }
            })
    }
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        )
    }
    return (
        <>
            <Navigation />

            <form onSubmit={handleCodeSubmit} method='post' className='w-82 mx-auto mt-15 flex flex-col border border-gray-200 rounded-md p-5'>
                <h2 className='text-center font-semibold mb-2 text-lg'>Password recovery form</h2>
                <p className='text-justify mb-2'>Enter yout email address and we will send you a code to reset your password.</p>
                <input type="email" id="email" autoComplete='email' placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} className='p-2 border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all' />
                <button disabled={!email} type='submit' className='w-fit mx-auto px-3 py-2 bg-gray-900 text-white rounded-md cursor-pointer'>Confirm</button>
            </form>
        </>
    )
}
