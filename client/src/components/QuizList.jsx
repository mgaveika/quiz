import { Link } from 'react-router-dom'
import Pagination from './Pagination.jsx'
import categoryOptions from "../utils/Categories.json"
import Icons from './Icons.jsx'
import Avatar from './Avatar.jsx'
import { useState } from 'react'

export default function QuizList({
    quizzes,
    totalQuizzes,
    totalPages,
    currentPage,
    showFilter = false,
    showSearch = true,
    onSearchChange,
    selectedFilters = [],
    onFilterChange,
    showCategories = true,
    link
}) {
    const [search, setSearch] = useState("")

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                {showSearch && (
                    <div className={`relative w-full ${showFilter ? "md:max-w-md" : ""} group`}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a quiz..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400 transition-colors"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Icons icon="search" className="w-5 h-5" />
                        </div>
                        <button
                            onClick={() => onSearchChange(search)}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg font-bold text-sm transition-colors"
                        >
                            Search
                        </button>
                    </div>
                )}

                {showFilter && (
                    <div className="flex gap-2 flex-wrap justify-end">
                        <button
                            onClick={() => {
                                if (onFilterChange) onFilterChange([])
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors cursor-pointer ${selectedFilters.length === 0
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                }`}
                        >
                            All
                        </button>
                        {categoryOptions.map(c => (
                            <button
                                onClick={() => {
                                    if (!onFilterChange) return
                                    const next = selectedFilters.includes(c)
                                        ? selectedFilters.filter(val => val !== c)
                                        : [...selectedFilters, c]
                                    onFilterChange(next)
                                }}
                                key={c}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors cursor-pointer ${selectedFilters.includes(c)
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {quizzes && quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons icon="search" className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No quizzes found</h3>
                    <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map(q => (
                            <Link key={q._id} to={`${link}${q._id}`} className="group block h-full">
                                <article className="bg-white h-full border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col hover:border-indigo-200 hover:shadow-md transition-shadow">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className="text-xl font-bold text-slate-800 line-clamp-2">
                                                {q.title}
                                            </h3>
                                            {q.score !== undefined && (
                                                <div className="shrink-0 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-xs font-black">
                                                    Score: {q.score}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                                            {q.description || "No description provided."}
                                        </p>

                                        {q.categories && q.categories.length > 0 && showCategories && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {q.categories.map((cat, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar size="24px" fontSize="10px" name={q.creator ? q.creator.username : "Unknown"} />
                                            <span className="text-xs font-semibold text-slate-400 truncate max-w-[120px]">
                                                By <span className="text-slate-600 font-bold">{q.creator ? q.creator.username : "Unknown"}</span>
                                            </span>
                                        </div>
                                        {q.date && (
                                            <span className="shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(q.date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalQuizzes={totalQuizzes} />
                </>
            )}
        </div>
    )
}

