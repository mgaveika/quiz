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
                console.log(data)
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
        <div className='flex flex-col h-screen'>
            {deleteAccount && <DeleteAccount confirm={confirmDeleteAccount} cancel={() => setDeleteAccount(false)} />}
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto'>
                    <div className="w-full bg-white rounded p-5">
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full bg-white border-1 border-gray-200 rounded-full px-4 py-1 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" />
                            <button onClick={handleSearch} className="flex items-center bg-white border border-gray-200 hover:bg-gray-100 rounded-lg px-2 cursor-pointer">
                                <Icons icon="search" className="w-5" />
                            </button>
                            <select value={role} onChange={(e) => handleSearchRoleChange(e.target.value)} className="border px-1 border-gray-300 rounded">
                                <option key="All" value="All">All</option>
                                {Roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center h-screen">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                            </div>
                        ) : users && users.length === 0 ? (
                            <div className="text-center">No users found.</div>
                        ) : (
                            <>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {users.map(u => (
                                        <li key={u._id} className="bg-white p-3 gap-2 border border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <div className='flex gap-2'>
                                                    <Avatar size="40px" fontSize="15px" name={u.username} />
                                                    <div className="flex flex-col">
                                                        <div className="font-semibold flex items-center justify-between gap-2">{u.username}
                                                            <select
                                                                id={"roles" + u._id}
                                                                value={u.role}
                                                                onChange={e => handleUserRoleChange(u._id, e.target.value)}
                                                                className="border px-1 border-gray-300 rounded"
                                                            >
                                                                {Roles.map(role => (
                                                                    <option key={role + u._id} value={role}>{role}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className="text-sm text-gray-600">{u.email}</span>
                                                    </div>
                                                </div>
                                                <div className='flex gap-2'>
                                                    {u.isLoggedIn && (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleUserLogout(u._id)} className="bg-white p-1 border border-gray-200 hover:border-gray-300 transition-colors rounded-md cursor-pointer"><Icons icon="exit" className="w-5" /></button>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setDeleteAccount(u._id)} className="bg-red-50 p-1 border border-red-100 hover:border-red-2W00 transition-colors rounded-md cursor-pointer"><Icons icon="bin" className="w-5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Pagination currentPage={page} totalPages={totalPages} totalQuizzes={totalUsers} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
