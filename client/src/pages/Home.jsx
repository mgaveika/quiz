import { useEffect, useState } from "react"
import Navigation from "../components/Navigation.jsx"
import { Link } from "react-router-dom"
export default function Home() {
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
                </section>
            </div>
        </main>
    )
}