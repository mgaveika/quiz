import { useState } from 'react'
import Icons from '../../components/Icons'
import { Link, useLocation } from 'react-router-dom'

export default function AdminNavigation() {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    return (
        <div className='w-56 bg-white border-r border-slate-200 flex flex-col p-3 gap-1 h-full'>
            <div className="px-3 py-3 mb-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Menu</h2>
            </div>

            <Link
                to="/admin"
                className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg font-bold transition-colors ${isActive('/admin')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Icons icon="dashboard" className="w-4 h-4" />
                <span className="text-xs">Dashboard</span>
            </Link>

            <Link
                to="/admin/users"
                className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg font-bold transition-colors ${isActive('/admin/users')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Icons icon="people" className="w-4 h-4" />
                <span className="text-xs">Users</span>
            </Link>

            <Link
                to="/admin/quizes"
                className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg font-bold transition-colors ${isActive('/admin/quizes')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Icons icon="quiz" className="w-4 h-4" />
                <span className="text-xs">Quizzes</span>
            </Link>
        </div>
    )
}
