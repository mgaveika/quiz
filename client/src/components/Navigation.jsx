import { useState } from "react"
import { Link } from "react-router"

export default function Navigation(props) {
    const [ optionsOpen, setOptionsOpen ] = useState(false)
    return (
        <nav className="w-full h-16 bg-white flex items-center justify-between px-8 shadow-md">
            <div className="flex items-center space-x-4">
                <img className="w-10" src="/quiz.svg" alt="logo image" />
                <div className="flex space-x-4">
                    <a className="text-gray-600 hover:text-gray-900 transform duration-300" href="/">Home</a>
                </div>
            </div>
            {props.auth.isAuthenticated ? (
                <div className="relative inline-block text-left">
                    <div>
                        <button onClick={() => setOptionsOpen(!optionsOpen)} type="button" className="inline-flex cursor-pointer w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50" aria-expanded="true" aria-haspopup="true">
                        {props.auth.user.username}
                        </button>
                    </div>
                    <div className={`${optionsOpen ? "" : "hidden"} absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1`}>
                        <div className="py-1">
                            <button onClick={props.logout} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Log out</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    <Link to="/register" className="text-gray-800 bg-blue">Register</Link>
                    <Link to="/login" className="text-gray-800 bg-gray">Login</Link>
                </div>
            )}
        </nav>
    )
}