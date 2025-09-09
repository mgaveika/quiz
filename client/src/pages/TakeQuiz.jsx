import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navigation from "../components/Navigation"
import toast from "react-hot-toast"
import Avatar from "../components/Avatar"

export default function ViewQuiz() {
    const [quizData, setQuizData] = useState(null)
    const [started, setStarted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const [attemptData, setAttemptData] = useState([])
    const progressBar = useMemo(() => {
        return (!quizData?.quizQuestions) ? 0 : Math.floor(((currentQuestion + 1) / quizData.quizQuestions.length) * 100)
    }, [currentQuestion, quizData])
    const {quizId} = useParams()
    const navigate = useNavigate()

    function handleSelectOption(optionId) {
        const answerType = quizData.quizQuestions[currentQuestion].answerType;
        setSelectedAnswers(prev => {
            const updated = [...prev];
            if (answerType === "multi") {
                const currentSelected = updated[currentQuestion] || [];
                if (currentSelected.includes(optionId)) {
                    updated[currentQuestion] = currentSelected.filter(i => i !== optionId);
                } else {
                    updated[currentQuestion] = [...currentSelected, optionId];
                }
            } else {
                updated[currentQuestion] = optionId;
            }
            return updated;
        });
    }

    function handleClick(action, value) {
        const answerType = quizData?.quizQuestions[currentQuestion]?.answerType;
        if (action === "next" || action === "submit") {
            const answer = selectedAnswers[currentQuestion];
            if (
                (answerType === "multi" && (!answer || answer.length === 0)) ||
                (answerType !== "multi" && answer == null)
            ) {
                toast.error("Select answer first!");
                return;
            }
            fetch(`/api/quiz-attempt/${attemptData._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    questionId: quizData.quizQuestions[currentQuestion]._id,
                    answer: answer // array for multi, index for single
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    ((quizData.quizQuestions.length - 1) > currentQuestion) && setCurrentQuestion(currentQuestion + 1);
                    toast.success(data.message);
                    if (action === "submit") {
                        navigate(`/quiz/${quizId}/results/${attemptData._id}`);
                    }
                } else {
                    toast.error(data.message);
                }
            });
        } else if (action === "prev") {
            (currentQuestion >= 1) && setCurrentQuestion(currentQuestion - 1)
        } else if (action === "select") {
            handleSelectOption(value);
        } else if (action === "start") {
            fetch("/api/quiz-attempt", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quizId: quizData.quiz._id
                })
            }).then(res => res.json())
            .then(data => {
                if (data.status == "success") {
                    setAttemptData(data.data)
                    setStarted(true)
                } else {
                    toast.error(data.message)
                }
            })
        }
    }
    useEffect(() => {
        fetch(`/api/quizzes/${quizId}`, {
                credentials: 'include'
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setQuizData(data.data)
            } else {
                toast.error(data.message)
                navigate("/my-quizzes")
            }
        })
    }, [])

    return (
        <>
            <Navigation />
            {!quizData ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : ( <>
                {!started ? (
                    <div className="max-w-2xl bg-white mx-auto p-4 shadow-sm overflow-hidden rounded mt-5 flex flex-col items-center justify-center">
                        <div className="border-b-1 border-gray-200 pb-5">
                            <h2 className="text-2xl font-bold text-center">{quizData.quiz.title}</h2>
                            <p className="text-gray-500 mt-2 text-center">{quizData.quiz.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-5">
                            <Avatar size="20px" fontSize="10px" name={quizData.username}/>
                            <p className="text-gray-500">{quizData.username}</p>
                            <div className="w-px h-4 bg-gray-400"></div>
                            <p className="text-gray-500">{quizData.quizQuestions.length} questions</p>
                        </div>
                        <div className="w-full flex items-center justify-center space-x-2 mt-5">
                            <button 
                                onClick={() => navigate("/my-quizzes")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-gray-50 border border-gray-200 text-neutral-500 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => handleClick("start")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                            >
                                Start Quiz
                            </button>
                        </div>
                    </div>
                ) : ( <>
                    <div className="max-w-5xl bg-white rounded shadow-sm mx-auto p-5 mt-5 flex flex-col">
                        <h2 className="text-2xl font-bold">{quizData.quiz.title}</h2>
                        <p className="text-gray-500">{quizData.quiz.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-5 mb-3">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-purple-900 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressBar}%` }}
                            ></div>
                        </div>
                        <span className="mx-auto text-gray-400">Question {currentQuestion + 1} of {quizData.quizQuestions.length}</span>
                    </div>
                    <div className="max-w-5xl bg-white rounded shadow-sm mx-auto p-5 mt-5 flex flex-col">
                        <h2 className="text-2xl font-bold">{quizData.quizQuestions[currentQuestion].questionText}</h2>
                        <div className="flex flex-col gap-y-2 mt-5">
                            {quizData.quizQuestions[currentQuestion].options.map((option, id) => {
                                const answerType = quizData.quizQuestions[currentQuestion].answerType;
                                if (answerType === "multi") {
                                    const checked = (selectedAnswers[currentQuestion] || []).includes(id);
                                    return (
                                        <label
                                            key={id}
                                            className={`w-full p-4 cursor-pointer text-left border-2 rounded-xl flex items-center gap-2 transition-all duration-200 hover:shadow-md
                                                ${checked ? "border-purple-950 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleSelectOption(id)}
                                            />
                                            <span className="text-gray-900">{option.option}</span>
                                        </label>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleSelectOption(id)}
                                            className={`w-full p-4 cursor-pointer text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md
                                                ${selectedAnswers[currentQuestion] === id ? "border-purple-950 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <span className="text-gray-900">{option.option}</span>
                                        </button>
                                    );
                                }
                            })}
                        </div>
                        <div className="flex items-center justify-between mt-5">
                            <button 
                                onClick={() => handleClick("prev")}
                                className="flex items-center cursor-pointer px-5 py-2 bg-gray-50 border border-gray-200 text-neutral-500 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                Previous
                            </button>
                            {quizData.quizQuestions.length === (currentQuestion + 1) ?
                                <button 
                                    onClick={() => handleClick("submit")}
                                    className="flex items-center cursor-pointer px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                >
                                    Submit
                                </button>
                            : 
                                <button 
                                    onClick={() => handleClick("next")}
                                    className="flex items-center cursor-pointer px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                >
                                    Next
                                </button>
                            } 
                        </div>
                    </div>
                </>)}
            </>)}
        </>
    )
}
