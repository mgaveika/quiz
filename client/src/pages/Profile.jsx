import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import Avatar from "../components/Avatar.jsx"

export default function Profile() {
    const [auth, setAuth] = useState({ loading: true, isAuthenticated: false, user: null })
    const [activeTab, setActiveTab] = useState("profile");
    const [errorMsg, setErrorMsg] = useState([])

    function logout() {
        localStorage.removeItem("token")
        setAuth({ loading: false, isAuthenticated: false, user: null })
        window.location.href = "/"
    }

    async function handleSubmit(event) {
        event.preventDefault()
        const currentPassword = event.target.currentPassword.value
        const newPassword = event.target.newPassword.value
        const confirmNewPassword = event.target.confirmNewPassword.value
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                logout()
                return
            }
            const response = await fetch("http://localhost:3000/api/auth/updatePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword
                }),
            })
            const data = await response.json()
            setErrorMsg(data)
        } catch (error) {
            setErrorMsg({msg: 'Error: '+ error.message, msgType: 'error'})
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            logout()
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
                <div className="max-w-5xl bg-white rounded shadow-sm mx-auto mt-5 flex flex-col items-center relative overflow-hidden">
                    <div className="w-full h-25 bg-linear-65 from-purple-500 to-pink-500 absolute z-0"></div>
                    <div className="mt-20 z-1"><Avatar size="80px" fontSize="40px" name={auth.user.username} outline="20px solid #ffffff"/></div>
                    <h1 className="font-bold text-lg z-1">{auth.user.username}</h1>
                    <h1 className="font-thin text-gray-700">{auth.user.email}</h1>
                    <div className="flex gap-6 mt-5 h-15">
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <h1 className="font-bold">Points</h1>
                            <span className="text-gray-700">TBA</span>
                        </div>
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <h1 className="font-bold">Member since</h1>
                            <span className="text-gray-700">{auth.user.created_at.substring(0,10).replace(/-/g,".")}</span>
                        </div>
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <h1 className="font-bold">Quizes</h1>
                            <span className="text-gray-700">TBA</span>
                        </div>
                    </div>
                </div>
                <div className="flex mt-3 gap-3 max-w-5xl mx-auto mb-5">
                    <div className="flex flex-col w-72 bg-white shadow-sm p-6 rounded h-full">
                        <div className="flex flex-col gap-y-2 flex-grow">
                            <button onClick={() => setActiveTab("profile")} className={`w-full text-left p-2 cursor-pointer hover:border-r-3 border-blue-700 ${ activeTab === "profile" ? "border-r-3 border-blue-700" : "" }`} >
                                Profile settings
                            </button>
                            <button onClick={() => setActiveTab("password")} className={`w-full text-left p-2 cursor-pointer hover:border-r-3 border-blue-700 ${ activeTab === "password" ? "border-r-3 border-blue-700" : "" }`} >
                                Change password
                             </button>
                        </div>
                        <button className="bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 w-full p-2 mt-20">
                            Delete account
                        </button>
                    </div>
                    <div className="flex-1 bg-white shadow-sm p-8 rounded">
                        {errorMsg && <div className={`${errorMsg.msgType === "error" ? "text-red-500" : "text-green-500"} text-center mb-4`}>{errorMsg.msg}</div>}
                        {activeTab === "profile" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                                <p>Update your profile information here.</p> 
                            </div>
                        )}
                        {activeTab === "password" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                                <p>Update your password securely.</p>
                                <form onSubmit={handleSubmit} className="flex flex-col mt-5">
                                    <label className="text-sm font-medium mb-2" htmlFor="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your current password" />
                                    <label className="text-sm font-medium mb-2" htmlFor="newPassword">New password</label>
                                    <input type="password" id="newPassword" className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter new password" />
                                    <label className="text-sm font-medium mb-2" htmlFor="confirmNewPassword">Confirm new password</label>
                                    <input type="password" id="confirmNewPassword" className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm new password"/>
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">Change password</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </>}
        </main>
    )
}
