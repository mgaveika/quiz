import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import { BrowserRouter as Router, Routes, Route } from "react-router"

import "./index.css"
// Guest routes
import Register from "./pages/auth/Register.jsx"
import Login from "./pages/auth/Login.jsx"
import Home from "./pages/Home.jsx"
import PublicQuizes from "./pages/quiz/PublicQuizes.jsx"
import QuizHome from "./pages/quiz/QuizHome.jsx"
import QuizRezult from "./pages/quiz/QuizRezult.jsx"
import GameRoom from "./pages/rooms/GameRoom.jsx"
import Play from "./pages/rooms/Play.jsx"
import ForgotPassword from "./pages/auth/ForgotPassword.jsx"
import VerifyCode from "./pages/auth/VerifyCode.jsx"
import WordleHome from "./pages/wordle/WordleHome.jsx"
import WordleResult from "./pages/wordle/WordleResult.jsx"
//Logged user routes
import Profile from "./pages/auth/Profile.jsx"
import CreateQuiz from "./pages/quiz/CreateQuiz.jsx"
import EditQuiz from "./pages/quiz/EditQuiz.jsx"
//Admin routes
import Main from "./pages/admin/Main.jsx"
import Quizes from "./pages/admin/Quizes.jsx"
import Users from "./pages/admin/Users.jsx"

import { AuthProvider } from "./utils/AuthContext.jsx"

import ProtectedRoutes from "./utils/ProtectedRoutes.jsx"
import AdminRoutes from "./utils/AdminRoutes.jsx"

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/:token" element={<VerifyCode />} />
          <Route path="/list" element={<PublicQuizes />} />
          <Route path="/quiz/:quizId" element={<QuizHome />} />
          <Route path="/room/:code" element={<GameRoom />} />
          <Route path="/room/:code/live" element={<Play />} />
          <Route path="/wordle/result/:attemptId" element={<WordleResult />} />
          <Route path="/quiz/result/:attemptId" element={<QuizRezult />} />
          <Route path="/wordle" element={<WordleHome />} />
          <Route element={<ProtectedRoutes />} >
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/quiz/:quizId/edit" element={<EditQuiz />} />
            <Route element={<AdminRoutes />} >
              <Route path="/admin" element={<Main />} />
              <Route path="/admin/quizes" element={<Quizes />} />
              <Route path="/admin/users" element={<Users />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <>
    <Toaster />
    <App />
  </>
  // </StrictMode>
)