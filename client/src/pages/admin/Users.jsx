import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'
import { useSearchParams } from "react-router-dom"
import Pagination from '../../components/Pagination'
import Avatar from '../../components/Avatar'

export default function Users() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1

    useEffect(() => {
        fetch(`/api/admin/users?page=${page}`, {
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setUsers(data.data.users)
                setTotalPages(data.data.totalPages)
                setTotalUsers(data.data.totalUsers)
                setLoading(false)
            })
    }, [page])
    return (
        <div className='flex flex-col h-screen'>
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto'>
                    <div className="w-full bg-white rounded p-5">
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
                                        <li key={u._id} className="bg-white p-3 gap-2 border border-gray-100 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <Avatar size="30px" fontSize="15px" name={u.username} />
                                                <div className="font-semibold hover:text-purple-700 transition-colors">{u.username}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                                                <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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
