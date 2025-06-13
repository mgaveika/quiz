export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-52">
                <div className="flex justify-around">
                    <a href="/register" className="text-blue-600">Register</a>
                    <a href="/login" className="text-blue-600">Login</a>
                </div>
            </div>
        </div>
    )
}