import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router"

import "./index.css"

import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import Home from "./pages/Home.jsx"
import Profile from "./pages/Profile.jsx"
import QuizList from "./pages/QuizList.jsx"
import CreateQuiz from "./pages/CreateQuiz.jsx"
import TakeQuiz from "./pages/TakeQuiz.jsx"
import QuizRezult from "./pages/QuizRezult.jsx"
import EditQuiz from "./pages/EditQuiz.jsx"

import ProtectedRoutes from "./utils/ProtectedRoutes.jsx"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />} >
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-quizzes" element={<QuizList />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/quiz/:quizId" element={<TakeQuiz />} />
          <Route path="/quiz/:quizId/results/:attemptId" element={<QuizRezult />} />
          <Route path="/quiz/:quizId/edit" element={<EditQuiz />} />
        </Route>
      </Routes>
    </Router>
  )
}

createRoot(document.getElementById("root")).render(
  //<StrictMode>
  <>
    <Toaster />
    <App />
  </>
  //</StrictMode>
)