import Navigation from "../components/Navigation.jsx"
import QuizForm from "../components/QuizForm.jsx"

export default function CreateQuiz() {
    return (
        <main className="min-h-screen">
            <Navigation />
            <QuizForm isEdit={false} />
        </main>
    )
}