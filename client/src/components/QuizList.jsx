import { Link } from 'react-router-dom'
import Pagination from './Pagination.jsx'
import categoryOptions from "../utils/Categories.json"

export default function QuizList({
    quizzes,
    totalQuizzes,
    totalPages,
    currentPage,
    showFilter = false,
    showSearch = true,
    selectedFilters = [],
    onFilterChange,
    showCategories = true,
    link
}) {
    return (
        <>
            {showSearch && (
                <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="Search" className="w-full bg-white border-1 border-gray-200 rounded-full px-4 py-1 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" />
                </div>
            )}
            {showFilter && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {categoryOptions.map(c => (
                        <button
                            onClick={() => onFilterChange && onFilterChange(c)}
                            key={c}
                            className={`border-1 ${selectedFilters.includes(c) ? "bg-gray-200 border-purple-700" : "bg-gray-100 border-gray-200"} border-gray-200 hover:bg-gray-200 transform duration-300 px-2 py-1 rounded-full cursor-pointer`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {quizzes && quizzes.length === 0 ? (
                <div className="text-center">No quizzes found.</div>
            ) : (
                <>
                    <ul className="flex flex-col space-y-2">
                        {quizzes.map(q => (
                            <li key={q._id} className="bg-white shadow-sm p-3 flex justify-between border-b border-gray-100 last:border-0">
                                <Link to={`${link}${q._id}`} className="font-semibold hover:text-purple-700 transition-colors">{q.title}</Link>
                                <div className="flex gap-1">
                                    {showCategories && q.categories.map((c, idx) => (
                                        <div key={idx + c} className="text-sm rounded-full border-1 border-gray-200 bg-gray-100 px-2 text-gray-600">{c}</div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalQuizzes={totalQuizzes} />
                </>
            )}
        </>
    )
}
