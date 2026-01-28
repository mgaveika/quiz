import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../components/Icons.jsx"
import QuizList from "../components/QuizList.jsx"

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
                    setTotalPages(data.data.totalPages)
                    setTotalQuizzes(data.data.totalQuizzes)
                } else {
                    toast.error(data.message)
                }
            })
    }, [page, filter, search])

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

    const handleSearch = (searchValue) => {
        setSearchParams({ page: 1 })
        setSearch(searchValue)
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="max-w-5xl mx-auto mt-5 flex flex-col text-gray-700">
                <div className="flex justify-end mb-3">
                    <Link to="/create" className="bg-purple-700 hover:bg-purple-800 cursor-pointer text-white px-4 py-2 rounded w-40 font-bold flex items-center justify-center">
                        <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                        Create Quiz
                    </Link>
                </div>
                <h2 className="text-2xl font-bold mb-4">Public quizzes</h2>
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
