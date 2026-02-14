import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'
import { useSearchParams } from "react-router-dom"
import Pagination from '../../components/Pagination'
import Avatar from '../../components/Avatar'
import { toast } from 'react-hot-toast'
import Icons from '../../components/Icons'
import DeleteAccount from '../../components/DeleteAccount'
import Roles from '../../utils/Roles.json'

export default function Users() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [search, setSearch] = useState("")
    const [role, setRole] = useState("")
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1

    useEffect(() => {
        updateInfoFromDB()
    }, [page, role])

    const updateInfoFromDB = () => {
        fetch(`/api/admin/users?page=${page}&role=${role}&search=${search}`, {
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setUsers(data.data.usersInfo)
                setTotalPages(data.data.totalPages)
                setTotalUsers(data.data.totalUsers)
                setLoading(false)
            })
    }

    const handleUserLogout = (userId) => {
        fetch(`/api/admin/logout/${userId}`, {
            method: "POST",
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    toast.success(data.message)
                    setUsers(users.map(u => u._id === userId ? { ...u, isLoggedIn: false } : u))
                } else {
                    toast.error(data.message)
                }
            })
    }

    async function confirmDeleteAccount() {
        fetch(`/api/admin/deleteUser/${deleteAccount}`, {
            method: "DELETE",
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    toast.success(data.message)
                    setUsers(users.filter(u => u._id !== deleteAccount))
                    setDeleteAccount(false)
                } else {
                    toast.error(data.message)
                }
            })
    }

    const handleUserRoleChange = (userId, role) => {
        fetch(`/api/admin/updateRole/${userId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    toast.success(data.message)
                    setUsers(users.map(u => u._id === userId ? { ...u, role } : u))
                } else {
                    toast.error(data.message)
                }
            })
    }
    const handleSearchRoleChange = (role) => {
        setSearchParams({ page: 1 })
        setRole(role)
    }

    const handleSearch = () => {
        setSearchParams({ page: 1 })
        updateInfoFromDB()
    }
    return (
        <div className='flex flex-col h-screen bg-slate-50'>
            {deleteAccount && <DeleteAccount confirm={confirmDeleteAccount} cancel={() => setDeleteAccount(false)} />}
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto p-8'>
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Manage Users</h1>
                        <p className="text-slate-500 font-medium">Control user access and roles.</p>
                    </div>

                    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-2 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Icons icon="search" className="w-5 h-5" />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1.5 bottom-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-lg font-bold text-xs"
                                >
                                    Search
                                </button>
                            </div>

                            <select
                                value={role}
                                onChange={(e) => handleSearchRoleChange(e.target.value)}
                                className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                            >
                                <option key="All" value="All">All Roles</option>
                                {Roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : users && users.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">No users found.</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-3 mb-6">
                                    {users.map(u => (
                                        <div key={u._id} className="bg-white p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-indigo-100 transition-colors">
                                            <div className='flex items-center gap-4 w-full md:w-auto'>
                                                <Avatar size="48px" fontSize="18px" name={u.username} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{u.username}</span>
                                                        {u.isLoggedIn && (
                                                            <span className="w-2 h-2 rounded-full bg-green-500" title="Online"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-medium">{u.email}</span>
                                                </div>
                                            </div>

                                            <div className='flex items-center gap-3 w-full md:w-auto justify-between md:justify-end'>
                                                <select
                                                    id={"roles" + u._id}
                                                    value={u.role}
                                                    onChange={e => handleUserRoleChange(u._id, e.target.value)}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                                                >
                                                    {Roles.map(role => (
                                                        <option key={role + u._id} value={role}>{role}</option>
                                                    ))}
                                                </select>

                                                <div className="flex items-center gap-2">
                                                    {u.isLoggedIn && (
                                                        <button
                                                            onClick={() => handleUserLogout(u._id)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Force Logout"
                                                        >
                                                            <Icons icon="exit" className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteAccount(u._id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Icons icon="bin" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination currentPage={page} totalPages={totalPages} totalQuizzes={totalUsers} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

