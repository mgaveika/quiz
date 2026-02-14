import { useEffect, useState, useContext } from "react"
import Navigation from "../../components/Navigation.jsx"
import Avatar from "../../components/Avatar.jsx"
import DeleteAccount from "../../components/DeleteAccount.jsx"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import QuizList from "../../components/QuizList.jsx"
import Icons from "../../components/Icons.jsx"

import { AuthContext } from "../../utils/AuthContext.jsx"

export default function Profile() {
    const { user } = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("quizzes")
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [quizes, setQuizes] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalQuizzes, setTotalQuizzes] = useState(0)
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
        if (activeTab === "quizzes") {
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
            fetch(`/api/gameAttempt/history?page=${page}&search=${search}`, {
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
    }, [activeTab, page, search, filter])

    const handleFilterChange = (newFilters) => {
        setSearchParams({ page: 1 })
        setFilter(newFilters)
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
        <main className="min-h-screen bg-slate-50 pb-12">
            {deleteAccount && <DeleteAccount confirm={confirmDeleteAccount} cancel={() => setDeleteAccount(false)} />}
            {(!user || !user.auth) ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <>
                    <Navigation />
                    <div className="max-w-7xl mx-auto px-6 mt-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                            <div className="h-32 bg-indigo-600 w-full"></div>
                            <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6">
                                <div className="p-1.5 bg-white rounded-full">
                                    <Avatar size="120px" fontSize="48px" name={user.user.username} />
                                </div>
                                <div className="flex-1 mb-2">
                                    <h1 className="text-3xl font-black text-slate-800">{user.user.username}</h1>
                                    <p className="text-slate-500 font-medium">{user.user.email}</p>
                                </div>
                                <div className="flex gap-8 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-slate-800">{user.user.createdAt.substring(0, 10).replace(/-/g, "/")}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Member Since</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 space-y-1">
                                    <button
                                        onClick={() => handleTabSwitch("quizzes")}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "quizzes" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Icons icon="quiz" className="w-5 h-5" />
                                        My Quizzes
                                    </button>
                                    <button
                                        onClick={() => handleTabSwitch("history")}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "history" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Icons icon="history" className="w-5 h-5" />
                                        History
                                    </button>
                                    <button
                                        onClick={() => handleTabSwitch("password")}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "password" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Icons icon="lock" className="w-5 h-5" />
                                        Security
                                    </button>

                                    <div className="h-px bg-slate-100 my-2 mx-2"></div>

                                    <button
                                        onClick={() => setDeleteAccount(true)}
                                        className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-red-500 hover:bg-red-50"
                                    >
                                        <Icons icon="bin" className="w-5 h-5" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
                                    {activeTab === "password" && (
                                        <div className="max-w-xl">
                                            <h2 className="text-2xl font-black text-slate-800 mb-2">Change Password</h2>
                                            <p className="text-slate-500 mb-8">Update your password to keep your account secure.</p>

                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="currentPassword">Current Password</label>
                                                    <input
                                                        type="password"
                                                        id="currentPassword"
                                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                                                        placeholder="Enter your current password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="newPassword">New Password</label>
                                                    <input
                                                        type="password"
                                                        id="newPassword"
                                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                                                        placeholder="Enter new password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="confirmNewPassword">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        id="confirmNewPassword"
                                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl mt-4"
                                                >
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {activeTab === "quizzes" && (
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-800">My Quizzes</h2>
                                                    <p className="text-slate-500">Manage the quizzes you've created.</p>
                                                </div>
                                                <button
                                                    onClick={() => navigate("/create")}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm"
                                                >
                                                    + Create New
                                                </button>
                                            </div>

                                            {loading ? (
                                                <div className="flex items-center justify-center h-40">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
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
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-black text-slate-800">Quiz History</h2>
                                                <p className="text-slate-500">Review your past performance.</p>
                                            </div>
                                            {loading ? (
                                                <div className="flex items-center justify-center h-40">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                                                </div>
                                            ) : (
                                                <QuizList
                                                    quizzes={quizes}
                                                    showFilter={false}
                                                    onSearchChange={handleSearch}
                                                    totalPages={totalPages}
                                                    totalQuizzes={totalQuizzes}
                                                    currentPage={page}
                                                    link={"/quiz/result/"}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    )
}

