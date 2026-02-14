import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'
import Icons from '../../components/Icons'

export default function Main() {
    const [data, setData] = useState({ totalQuizes: 0, totalAttempts: 0, registeredUsers: 0, totalQuestions: 0 })

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then(res => res.json())
            .then(data => setData(data.data))
    }, [])

    return (
        <div className='flex flex-col h-screen bg-slate-50'>
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto p-6'>
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
                        <p className="text-slate-500 font-medium text-sm">Overview of your platform's performance.</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <StatCard
                            title="Total Quizzes"
                            value={data.totalQuizes}
                            icon="quiz"
                            color="bg-indigo-50 text-indigo-600"
                        />
                        <StatCard
                            title="Total Questions"
                            value={data.totalQuestions}
                            icon="dashboard"
                            color="bg-purple-50 text-purple-600"
                        />
                        <StatCard
                            title="Total Attempts"
                            value={data.totalAttempts}
                            icon="history"
                            color="bg-blue-50 text-blue-600"
                        />
                        <StatCard
                            title="Registered Users"
                            value={data.registeredUsers}
                            icon="people"
                            color="bg-pink-50 text-pink-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                <Icons icon={icon} className="w-5 h-5" />
            </div>
            <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wide mb-1">{title}</p>
                <h2 className="text-3xl font-black text-slate-800">{value}</h2>
            </div>
        </div>
    )
}
