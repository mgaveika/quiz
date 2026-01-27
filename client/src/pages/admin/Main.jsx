import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'

export default function Main() {
    const [data, setData] = useState({ totalQuizes: 0, totalAttempts: 0, registeredUsers: 0, totalQuestions: 0 })

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then(res => res.json())
            .then(data => setData(data.data))
    }, [])

    return (
        <div className='flex flex-col h-screen'>
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto'>
                    <div className='flex gap-7 p-3'>
                        <div className='flex-1 bg-white border border-gray-100 rounded-lg p-8'>
                            <h2 className="text-xl font-semibold text-center">Total Quizes</h2>
                            <p className="text-xl text-center">{data.totalQuizes}</p>
                        </div>
                        <div className='flex-1 bg-white border border-gray-100 rounded-lg p-8'>
                            <h2 className="text-xl font-semibold text-center">Total Questions</h2>
                            <p className="text-xl text-center">{data.totalQuestions}</p>
                        </div>
                        <div className='flex-1 bg-white border border-gray-100 rounded-lg p-8'>
                            <h2 className="text-xl font-semibold text-center">Total Attempts</h2>
                            <p className="text-xl text-center">{data.totalAttempts}</p>
                        </div>
                        <div className='flex-1 bg-white border border-gray-100 rounded-lg p-8'>
                            <h2 className="text-xl font-semibold text-center">Registered Users</h2>
                            <p className="text-xl text-center">{data.registeredUsers}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
