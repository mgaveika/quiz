import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router";
import Avatar from "../components/Avatar.jsx"
import { useCookies } from "react-cookie"

export default function Navigation() {
    const [auth, setAuth] = useState({ isAuthenticated: false, user: null })
    const [optionsOpen, setOptionsOpen] = useState(false)
    const dropdownRef = useRef()
    const [cookies, removeCookie] = useCookies(["jwt-auth"])
    const navigate = useNavigate()

    function logout() {
        removeCookie("jwt-auth")
        setAuth({ loading: false, isAuthenticated: false, user: null })
        navigate("/login")
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
        if (cookies["jwt-auth"]) {
            fetch("/api/auth/isAuthenticated", {
                headers: { "x-access-token": cookies["jwt-auth"] }
            })
            .then(res => res.json())
            .then(data => {
                setAuth({ isAuthenticated: true, user: data.data.user })
            })
        }
    }, [])
    return (
        <nav className="w-full h-16 bg-white flex items-center justify-between px-8 shadow-sm">
            <Link to="/"><h1 className="text-2xl font-bold bg-gradient-to-r from-purple-800 via-pink-900 to-pink-700 inline-block text-transparent bg-clip-text">Quiz</h1></Link>

            {auth.isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setOptionsOpen(!optionsOpen)} type="button" className="flex items-center focus:outline-none cursor-pointer" aria-haspopup="true" aria-expanded={optionsOpen} >
                        <Avatar size="30px" fontSize="15px" name={auth.user.username} />
                        <img className={`ml-2 w-3 transform transition-transform duration-300 ${optionsOpen ? "rotate-180" : ""}`} src="/dropdown-arrow.png" alt="dropdown" />
                    </button>

                    <div className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out transform ${ optionsOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none" }`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1} >
                        <div className="py-1">
                            <div className="mx-2 px-2 py-2 text-sm text-gray-700 text-left border-b-1 border-gray-200">{auth.user.username}</div>
                            <Link to="/profile"><button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer">Profile</button></Link>
                            <Link to="/my-quizzes"><button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer">My Quizzes</button></Link>
                            <button onClick={logout} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer">Log out</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    <Link to="/register" className="text-gray-800 hover:underline">Register</Link>
                    <Link to="/login" className="text-gray-800 hover:underline">Login</Link>
                </div>
            )}
        </nav>
    );
}
