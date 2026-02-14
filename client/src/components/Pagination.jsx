import { Link, useSearchParams } from "react-router-dom"
import Icons from "./Icons"

export default function Pagination({ currentPage, totalPages, totalQuizzes }) {
    const [searchParams] = useSearchParams()
    const getPageUrl = (pageNumber) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("page", pageNumber)
        return `?${newParams.toString()}`
    }

    const getPageNumbers = () => {
        const pages = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const startPage = Math.max(2, currentPage - 1)
            const endPage = Math.min(totalPages - 1, currentPage + 1)

            pages.push(1)

            if (startPage > 2) {
                pages.push('...')
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            if (endPage < totalPages - 1) {
                pages.push('...')
            }

            pages.push(totalPages)
        }
        return pages
    }

    if (totalPages <= 1) return null

    const pageNumbers = getPageNumbers()
    const startRange = (currentPage - 1) * 12 + 1
    const endRange = Math.min(currentPage * 12, totalQuizzes)

    return (
        <div className="flex items-center justify-between py-3 border-t border-gray-200 mt-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    to={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    Previous
                </Link>
                <Link
                    to={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    Next
                </Link>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startRange}</span> to <span className="font-medium">{endRange}</span> of <span className="font-medium">{totalQuizzes}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Link
                            to={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <span className="sr-only">Previous</span>
                            <Icons icon="dropdown-arrow" className="size-5 rotate-90" />
                        </Link>

                        {pageNumbers.map((page, index) => (
                            page === '...' ? (
                                <span key={`pagination-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                    ...
                                </span>
                            ) : (
                                <Link
                                    key={page}
                                    to={getPageUrl(page)}
                                    aria-current={page === currentPage ? "page" : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${page === currentPage
                                        ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline focus-outline-2 focus:outline-offset-2 focus:outline-gray-300'
                                        }`}
                                >
                                    {page}
                                </Link>
                            )
                        ))}

                        <Link
                            to={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <span className="sr-only">Next</span>
                            <Icons icon="dropdown-arrow" className="size-5 rotate-270" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}
