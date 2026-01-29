import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { toast } from 'react-hot-toast'

export default function VerifyPasswordCode() {
    const { token } = useParams()
    const [code, setCode] = useState("")
    const [verified, setVerified] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        fetch("/api/auth/verifyPasswordResetPage", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setVerified(data.data.verified)
                } else {
                    navigate("/")
                }
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        fetch("/api/auth/verifyPasswordResetCode", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code, token })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setVerified(true)
                } else {
                    toast.error(data.message)
                }
            })
    }

    const handlePasswordReset = (e) => {
        e.preventDefault()
        fetch("/api/auth/resetPassword", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password, confirmPassword, token })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    navigate("/login")
                    toast.success(data.message)
                } else {
                    toast.error(data.message)
                }
            })
    }
    return (
        <>
            <Navigation />
            {!verified ? (
                <form onSubmit={handleSubmit} method='post' className='w-82 mx-auto mt-15 flex flex-col border border-gray-200 rounded-md p-5'>
                    <h2 className='text-center font-semibold mb-2 text-lg'>Verification code</h2>
                    <p className='text-justify mb-2'>We sent you a 6-digit verification code to your email address. You have 15 minutes to verify it.</p>
                    <input type="text" id="code" autoComplete='code' placeholder='000 000' value={code} maxLength={6} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} className='p-2 text-center text-lg font-bold border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all' />
                    <button disabled={!code || code.length < 6} type='submit' className={`w-fit mx-auto px-3 py-2 ${code && code.length === 6 ? "bg-gray-900 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white rounded-md`}>Confirm</button>
                </form>
            ) : (<>
                <form onSubmit={handlePasswordReset} method='post' className='w-82 mx-auto mt-15 flex flex-col border border-gray-200 rounded-md p-5'>
                    <h2 className='text-center font-semibold mb-2 text-lg'>Reset password</h2>
                    <p className='text-justify mb-2'>Enter your new password and confirm it.</p>
                    <input type="password" id="password" autoComplete='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='p-2 border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all' />
                    <input type="password" id="confirmPassword" autoComplete='confirmPassword' placeholder='Confirm password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='p-2 border border-gray-200 rounded-md mb-2 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all' />
                    <button disabled={!password || !confirmPassword} type='submit' className={`w-fit mx-auto px-3 py-2 ${password && confirmPassword ? "bg-gray-900 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white rounded-md`}>Reset password</button>
                </form>
            </>)}
        </>
    )
}
