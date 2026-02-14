import { useEffect, useState } from "react"
import Navigation from "../../components/Navigation.jsx"
import { Link, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../../components/Icons.jsx"
import QuizList from "../../components/QuizList.jsx"

export default function PublicQuizzes() {
    const [publicQuizzes, setPublicQuizzes] = useState([])
    const [filter, setFilter] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalQuizzes, setTotalQuizzes] = useState(0)
    const [search, setSearch] = useState("")
    const [searchParams, setSearchParams] = useSearchParams()
    const page = searchParams.get("page") && Number(searchParams.get("page")) ? Number(searchParams.get("page")) : 1

    useEffect(() => {
        fetch(`/api/quizzes?page=${page}&categories=${filter.join(",")}&search=${search}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setPublicQuizzes(data.data.publicQuizzes || [])
                    console.log(data.data.publicQuizzes)
                    setTotalPages(data.data.totalPages)
                    setTotalQuizzes(data.data.totalQuizzes)
                } else {
                    toast.error(data.message)
                }
            })
    }, [page, filter, search])

    const handleFilterChange = (newFilters) => {
        setSearchParams({ page: 1 })
        setFilter(newFilters)
    }

    const handleSearch = (searchValue) => {
        setSearchParams({ page: 1 })
        setSearch(searchValue)
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Explore Quizzes</h2>
                        <p className="text-slate-500 font-medium">Discover new challenges or create your own masterpiece.</p>
                    </div>
                    <Link
                        to="/create"
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-colors"
                    >
                        <Icons icon="plus" className="w-5 h-5" />
                        <span>Create New Quiz</span>
                    </Link>
                </div>

                <QuizList
                    quizzes={publicQuizzes}
                    showFilter={true}
                    selectedFilters={filter}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearch}
                    totalPages={totalPages}
                    totalQuizzes={totalQuizzes}
                    currentPage={page}
                    link={"/quiz/"}
                />
            </div>
        </main>
    )
}

