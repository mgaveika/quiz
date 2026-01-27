import { useState } from 'react'
import Icons from '../../components/Icons'
import { Link } from 'react-router-dom'

export default function AdminNavigation() {
    return (
        <div className='bg-white h-full border-r border-gray-100 w-50 overflow-y-auto text-gray-700'>
            <Link to="/admin" className='flex items-center w-full gap-2 hover:bg-purple-50 pl-8 py-4 border-b border-gray-100 cursor-pointer'>
                <Icons icon="dashboard" className="w-5" />
                <h2 className="text-md font-semibold">Dashboard</h2>
            </Link>
            <Link to="/admin/users" className='flex items-center w-full gap-2 hover:bg-purple-50 pl-8 py-4 border-b border-gray-100 cursor-pointer'>
                <Icons icon="people" className="w-5" />
                <h2 className="text-md font-semibold">Users</h2>
            </Link>
            <Link to="/admin/quizes" className='flex items-center w-full gap-2 hover:bg-purple-50 pl-8 py-4 border-b border-gray-100 cursor-pointer'>
                <Icons icon="quiz" className="w-5" />
                <h2 className="text-md font-semibold">Quizzes</h2>
            </Link>
        </div>
    )
}