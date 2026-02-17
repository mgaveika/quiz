import { useState, useEffect, useContext, useRef } from "react"
import { Link } from "react-router"
import Avatar from "../components/Avatar.jsx"
import Icons from "./Icons.jsx"
import { AuthContext } from "../utils/AuthContext.jsx"

export default function Navigation() {
    const { user, logout, isAdmin, loading } = useContext(AuthContext)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const dropdownRef = useRef()

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOptionsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm h-16">
            <div className="flex items-center gap-8">
                <Link to="/" className="group flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Icons icon="quiz" className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">GameHub</h1>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/quiz" className="text-gray-600 hover:text-indigo-600 font-semibold">Quizzes</Link>
                    <Link to="/wordle" className="text-gray-600 hover:text-indigo-600 font-semibold">Wordle</Link>
                    <Link to="/draw" className="text-gray-600 hover:text-indigo-600 font-semibold">Draw</Link>
                </div>
            </div>

            {!loading && (
                <div className="flex items-center gap-4">
                    {user && user.auth ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOptionsOpen(!optionsOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/50 hover:bg-white border border-white/50 shadow-sm"
                            >
                                <Avatar size="36px" fontSize="14px" name={user.user.username} />
                                <div className="hidden sm:block text-left mr-2">
                                    <p className="text-xs text-gray-400 font-medium leading-none mb-1">Account</p>
                                    <p className="text-sm font-bold text-gray-700 leading-none">{user.user.username}</p>
                                </div>
                                <Icons icon="dropdown-arrow" className={`w-4 h-4 text-gray-400 ${optionsOpen ? "rotate-180" : ""}`} />
                            </button>

                            {optionsOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl overflow-hidden origin-top-right">
                                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-white border-b border-gray-100">
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Logged in as</p>
                                        <p className="text-lg font-black text-gray-800">{user.user.username}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link to="/profile" onClick={() => setOptionsOpen(false)}>
                                            <button className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600">
                                                My Profile
                                            </button>
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setOptionsOpen(false)}>
                                                <button className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 rounded-xl hover:bg-purple-50 hover:text-purple-600">
                                                    Admin Dashboard
                                                </button>
                                            </Link>
                                        )}
                                        <div className="h-px bg-gray-100 my-1 mx-2" />
                                        <button
                                            onClick={() => { logout(); setOptionsOpen(false); }}
                                            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-500 rounded-xl hover:bg-red-50"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-gray-600 font-bold hover:text-indigo-600 px-4 py-2">Login</Link>
                            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:-translate-y-0 active:translate-y-0">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}
