import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Home() {
    const [code, setCode] = useState("")
    const navigate = useNavigate()
    const handleCodeChange = (p) => {
        setCode(p)
    }
    const hangleJoinClick = (event) => {
        event.preventDefault()
        fetch(`/api/room/${code}`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                navigate(`/room/${code}`)
            } else {
                toast.error(data.message)
            }
        })
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="text-gray-800 flex flex-col">
                <section className="text-center py-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                    Your Place to Create and Take Quizzes
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                    Start testing your knowledge or make your own quiz for others to try!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/list"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow"
                        >
                            Quiz list
                        </Link>
                        <Link
                            to="/create"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl shadow"
                        >
                            Create a Quiz
                        </Link>
                    </div>
                    <div className="max-w-400 mx-auto border-y-1 border-gray-200 bg-gray-50 py-12 rounded-md mt-15">
                        <p className="mb-1 text-lg font-semibold">Join an Online Quiz Room</p>
                        <p className="max-w-150 mx-auto">Enter the quiz PIN below to join the fun. Test your knowladge and compete with others in real time!</p>
                        <div className="w-fit mx-auto text-left mt-5">
                            <form onSubmit={hangleJoinClick}>
                                <label className="font-semibold" htmlFor="gamePin">Enter game pin</label>
                                <div className="flex justify-center gap-3">
                                    <input onChange={(e) => handleCodeChange(e.target.value)} id="gamePin" type="text" className="bg-white border-1 border-gray-300 px-2 py-1 rounded-md" placeholder="123456"/>
                                    <button type="submit" className="bg-green-600 rounded-md px-3 py-1 text-white h-fit">Join</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}