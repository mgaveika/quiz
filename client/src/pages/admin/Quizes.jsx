import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import AdminNavigation from './AdminNavigation'
import { useSearchParams } from "react-router-dom"
import Pagination from '../../components/Pagination'
import Icons from '../../components/Icons'
import categoryOptions from "../../utils/Categories.json"

export default function Quizes() {
    const [loading, setLoading] = useState(true)
    const [quizes, setQuizes] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalQuizes, setTotalQuizes] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState([])

    const updateInfoFromDatabase = () => {
        setLoading(true)
        fetch(`/api/admin/quizzes?page=${page}&categories=${filter.join(",")}&search=${search}`, {
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setQuizes(data.data.quizInfo)
                setTotalPages(data.data.totalPages)
                setTotalQuizes(data.data.totalQuizzes)
                setLoading(false)
            })
    }

    useEffect(() => {
        updateInfoFromDatabase()
    }, [page, filter])

    const handleSearch = () => {
        setSearchParams({ page: 1 })
        updateInfoFromDatabase()
    }
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
    return (
        <div className='flex flex-col h-screen bg-slate-50'>
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                <AdminNavigation />
                <div className='flex-1 overflow-y-auto p-8'>
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Manage Quizzes</h1>
                        <p className="text-slate-500 font-medium">View and manage all quizzes on the platform.</p>
                    </div>

                    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search quizzes..."
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
                        </div>

                        <div className="flex gap-2 mb-6 flex-wrap">
                            {categoryOptions.map(c => (
                                <button
                                    onClick={() => handleFilterChange(c)}
                                    key={c}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors ${filter.includes(c)
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : quizes && quizes.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">No quizzes found.</div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-3 mb-6">
                                    {quizes.map(q => (
                                        <div key={q._id} className="bg-white p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {q.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{q.title}</h3>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                                            {q.totalQuestions} Questions
                                                        </span>
                                                        {q.categories.map((c, idx) => (
                                                            <span key={idx + c} className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination currentPage={page} totalPages={totalPages} totalQuizzes={totalQuizes} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

