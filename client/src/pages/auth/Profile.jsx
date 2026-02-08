import { useEffect, useState, useContext } from "react"
import Navigation from "../../components/Navigation.jsx"
import Avatar from "../../components/Avatar.jsx"
import DeleteAccount from "../../components/DeleteAccount.jsx"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import QuizList from "../../components/QuizList.jsx"

import { AuthContext } from "../../utils/AuthContext.jsx"

export default function Profile() {
    const { user } = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("quizes")
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [quizes, setQuizes] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalQuizzes, setTotalQuizzes] = useState(1)
    const [filter, setFilter] = useState([])
    const [search, setSearch] = useState("")
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1
    const navigate = useNavigate()

    const handleTabSwitch = (tab) => {
        if (activeTab === tab || loading) return
        setLoading(true)
        setActiveTab(tab)
    }

    useEffect(() => {
        if (activeTab === "quizes") {
            fetch(`/api/quizzes/private?page=${page}&categories=${filter.join(",")}&search=${search}`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status == "success") {
                        setQuizes(data.data.privateQuizzes)
                        setTotalPages(data.data.totalPages)
                        setTotalQuizzes(data.data.totalQuizzes)
                        setLoading(false)
                    } else {
                        toast.error(data.message)
                    }
                })
        } else if (activeTab === "history") {
            fetch(`/api/quiz-attempt?page=${page}`, {
                method: "GET",
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status == "success") {
                        setQuizes(data.data.attemptQuizzes)
                        setTotalPages(data.data.totalPages)
                        setTotalQuizzes(data.data.totalQuizzes)
                        setLoading(false)
                    } else {
                        toast.error(data.message)
                    }
                })
        } else {
            setLoading(false)
        }
    }, [activeTab, page, search])

    const handleFilterChange = (c) => {
        setSearchParams({ page: 1 })
        if (filter.includes(c)) {
            setFilter(prev => (
                prev.filter(val => val !== c)
            ))
        } else {
            setFilter(prev => ([...prev, c]))
        }
    }

    const handleSearch = (searchValue) => {
        setSearchParams({ page: 1 })
        setSearch(searchValue)
    }

    function logout() {
        fetch("/api/user/logout", {
            method: "POST",
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    navigate("/login")
                } else {
                    toast.error(data.message)
                }
            })
    }

    async function confirmDeleteAccount() {
        fetch("/api/user/deleteAccount", {
            method: "DELETE",
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success(data.message)
                    logout()
                } else {
                    toast.error(data.message)
                }
            })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        const currentPassword = event.target.currentPassword.value
        const newPassword = event.target.newPassword.value
        const confirmNewPassword = event.target.confirmNewPassword.value
        fetch("/api/user/updatePassword", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmNewPassword
            }),
        }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    toast.success(data.message)
                    logout()
                } else if (data.status == "error") {
                    toast.error(data.message)
                } else {
                    toast(data.message)
                }
            })
    }
    return (
        <main className="min-h-screen">
            {deleteAccount && <DeleteAccount confirm={confirmDeleteAccount} cancel={() => setDeleteAccount(false)} />}
            {(!user || !user.auth) ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : <>
                <Navigation />
                <div className="max-w-5xl bg-white rounded shadow-sm mx-auto mt-5 flex flex-col items-center relative overflow-hidden">
                    <div className="w-full h-25 bg-linear-65 from-purple-500 to-pink-500 absolute z-0"></div>
                    <div className="mt-20 z-1"><Avatar size="80px" fontSize="40px" name={user.user.username} outline="20px solid #ffffff" /></div>
                    <span className="font-bold text-lg z-1">{user.user.username}</span>
                    <span className="font-thin text-gray-700">{user.user.email}</span>
                    <div className="flex gap-6 mt-5 h-15">
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <span className="font-bold">Points</span>
                            <span className="text-gray-700">TBA</span>
                        </div>
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <span className="font-bold">Member since</span>
                            <span className="text-gray-700">{user.user.createdAt.substring(0, 10).replace(/-/g, ".")}</span>
                        </div>
                        <div className="flex flex-col cursor-default items-center px-2 hover:border-b-3 border-blue-700 transform duration-100">
                            <span className="font-bold">Quizes</span>
                            <span className="text-gray-700">TBA</span>
                        </div>
                    </div>
                </div>
                <div className="flex mt-3 gap-3 max-w-5xl mx-auto mb-5">
                    <div className="flex flex-col w-72 bg-white shadow-sm p-6 rounded h-full">
                        <div className="flex flex-col gap-y-2 flex-grow">
                            <button onClick={() => handleTabSwitch("quizes")} className={`w-full text-left p-2 cursor-pointer hover:border-r-3 border-blue-700 ${activeTab === "quizes" ? "border-r-3 border-blue-700" : ""}`} >
                                My quizes
                            </button>
                            <button onClick={() => handleTabSwitch("history")} className={`w-full text-left p-2 cursor-pointer hover:border-r-3 border-blue-700 ${activeTab === "history" ? "border-r-3 border-blue-700" : ""}`} >
                                History
                            </button>
                            <button onClick={() => handleTabSwitch("password")} className={`w-full text-left p-2 cursor-pointer hover:border-r-3 border-blue-700 ${activeTab === "password" ? "border-r-3 border-blue-700" : ""}`} >
                                Change password
                            </button>
                        </div>
                        <button onClick={() => setDeleteAccount(true)} className="bg-red-600 text-white rounded-md cursor-pointer hover:bg-red-700 w-full p-2 mt-20">
                            Delete account
                        </button>
                    </div>
                    <div className="flex-1 bg-white shadow-sm p-8 rounded">
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
                                    <input type="password" id="confirmNewPassword" className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm new password" />
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">Change password</button>
                                </form>
                            </div>
                        )}
                        {activeTab === "quizes" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">My Quizes</h2>
                                <p>View your created quizes here.</p>
                                {loading ? (
                                    <div className="flex items-center justify-center z-10 transition-opacity mt-5">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <QuizList
                                        quizzes={quizes}
                                        showFilter={true}
                                        selectedFilters={filter}
                                        onFilterChange={handleFilterChange}
                                        onSearchChange={handleSearch}
                                        totalPages={totalPages}
                                        totalQuizzes={totalQuizzes}
                                        currentPage={page}
                                        link={"/quiz/"}
                                    />
                                )}
                            </div>
                        )}
                        {activeTab === "history" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Quiz history</h2>
                                <p>View your quiz history here.</p>
                                {loading ? (
                                    <div className="flex items-center justify-center z-10 transition-opacity mt-5">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <QuizList
                                        quizzes={quizes}
                                        showFilter={false}
                                        totalPages={totalPages}
                                        totalQuizzes={totalQuizzes}
                                        currentPage={page}
                                        showCategories={false}
                                        link={"/quiz/result/"}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </>}
        </main>
    )
}
