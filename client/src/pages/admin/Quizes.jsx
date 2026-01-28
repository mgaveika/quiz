import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'
import { useSearchParams } from "react-router-dom"
import Pagination from '../../components/Pagination'

export default function Quizes() {
    const [loading, setLoading] = useState(true)
    const [quizes, setQuizes] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalQuizes, setTotalQuizes] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1

    useEffect(() => {
        setLoading(true)
        fetch(`/api/admin/quizzes?page=${page}`, {
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setQuizes(data.data.quizInfo)
                setTotalPages(data.data.totalPages)
                setTotalQuizes(data.data.totalQuizzes)
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
                        ) : quizes && quizes.length === 0 ? (
                            <div className="text-center">No quizes found.</div>
                        ) : (
                            <>
                                <ul className="flex flex-col gap-1">
                                    {quizes.map(q => (
                                        <li key={q._id} className="bg-white p-3 flex flex-col border border-gray-100 last:border-0">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="font-semibold hover:text-purple-700 transition-colors">{q.title}
                                                    <span className="text-sm rounded-full border-1 border-gray-200 px-2 text-gray-600 ml-2">{q.totalQuestions}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {q.categories.map((c, idx) => (
                                                        <span key={idx + c} className="text-sm rounded-full border-1 border-gray-200 bg-gray-100 px-2 text-gray-600">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Pagination currentPage={page} totalPages={totalPages} totalQuizzes={totalQuizes} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
