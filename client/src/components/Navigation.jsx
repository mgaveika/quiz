import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router";
import Avatar from "../components/Avatar.jsx"
import Icons from "./Icons.jsx";

export default function Navigation() {
    const [auth, setAuth] = useState({ isAuthenticated: false, user: null })
    const [optionsOpen, setOptionsOpen] = useState(false)
    const dropdownRef = useRef()
    const navigate = useNavigate()

    function logout() {
        fetch("/api/auth/logout", {
            method: "POST",
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    //setAuth({ loading: false, isAuthenticated: false, user: null })
                    navigate("/login")
                }
            })
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOptionsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])

    useEffect(() => {
        fetch("/api/auth/isAuthenticated", {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setAuth({ isAuthenticated: true, user: data.data.user })
                }
            })
    }, [])
    return (
        <nav className="sticky top-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
            <Link to="/"><h1 className="text-2xl font-bold bg-gradient-to-r from-purple-800 via-pink-900 to-pink-700 inline-block text-transparent bg-clip-text">Quiz</h1></Link>

            {auth.isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setOptionsOpen(!optionsOpen)} type="button" className="flex items-center focus:outline-none cursor-pointer p-1 rounded-full hover:bg-gray-100/50 transition-colors" aria-haspopup="true" aria-expanded={optionsOpen} >
                        <div className="ring-2 ring-transparent hover:ring-purple-100 rounded-full transition-all">
                            <Avatar size="32px" fontSize="14px" name={auth.user.username} />
                        </div>
                        <Icons icon="dropdown-arrow" className={`ml-2 w-4 h-4 text-gray-500 transform transition-transform duration-300 ${optionsOpen ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 transition-all duration-200 ease-out transform ${optionsOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 -translate-y-2 pointer-events-none"}`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1} >
                        <div className="p-2">
                            <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100 mb-1">{auth.user.username}</div>
                            <Link to="/profile">
                                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer group">
                                    Profile
                                </button>
                            </Link>
                            <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer mt-1">
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-gray-600 font-medium hover:text-purple-600 transition-colors">Login</Link>
                    <Link to="/register" className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">Register</Link>
                </div>
            )}
        </nav>
    );
}
