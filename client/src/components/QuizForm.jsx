import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "./Icons.jsx"
import Avatar from "./Avatar.jsx"
import categoryOptions from "../utils/Categories.json"

export default function QuizForm({ quiz = null, isEdit = false }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [visibility, setVisibility] = useState(false)
    const [questions, setQuestions] = useState([
        {
            questionText: "",
            options: [
                { option: "", correctAnswer: true },
                { option: "", correctAnswer: false }
            ],
            answerType: "single"
        }
    ])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0])
    const [participants, setParticipants] = useState([])
    const [participantSearch, setParticipantSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()

    // Populate form data if editing
    useEffect(() => {
        if (isEdit && quiz) {
            setTitle(quiz.title || "")
            setDescription(quiz.description || "")
            setVisibility(quiz.visibility !== undefined ? quiz.visibility : false)
            setCategories(quiz.categories || [])
            setParticipants(quiz.participants || [])
            if (quiz.quizQuestions) {
                setQuestions(quiz.quizQuestions.map(quest => ({
                    questionText: quest.questionText,
                    options: quest.options,
                    answerType: quest.answerType
                })))
            }
        }
    }, [isEdit, quiz])

    const handleCategoriesChange = (value) => {
        setSelectedCategory(value)
        if (!categories.includes(value)) {
            setCategories(prev => [...prev, value])
        }
    }

    const handleRemoveCategory = (cat) => {
        setCategories(prev => prev.filter(c => c !== cat))
    }

    const handleParticipantSearch = async (searchTerm) => {
        setParticipantSearch(searchTerm)
        if (searchTerm.trim().length > 0) {
            try {
                const response = await fetch(`/api/user/search/${searchTerm}?limit=5`, {
                    credentials: "include",
                })
                const data = await response.json()
                if (data.status === "success") {
                    const filteredResults = data.data.filter(user =>
                        !participants.some(p => p.user === user._id)
                    )
                    setSearchResults(filteredResults)
                    setShowDropdown(filteredResults.length > 0)
                } else {
                    setSearchResults([])
                    setShowDropdown(false)
                }
            } catch (error) {
                console.error('Search error:', error)
                setSearchResults([])
                setShowDropdown(false)
            }
        } else {
            setSearchResults([])
            setShowDropdown(false)
        }
    }

    const handleSelectParticipant = (user) => {
        const participantData = isEdit
            ? { name: user.username, user: user._id }
            : { option: user.username, user: user._id }
        setParticipants(prev => [...prev, participantData])
        setParticipantSearch("")
        setSearchResults([])
        setShowDropdown(false)
    }

    const handleParticipantDelete = (participantIndex) => {
        setParticipants(prevParticipants =>
            prevParticipants.filter((_, key) => key !== participantIndex)
        )
    }

    const handleQuestionChange = (questionIndex, newQuestionText) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex ? { ...question, questionText: newQuestionText } : question
        ))
    }

    const handleOptionChange = (questionIndex, optionIndex, newOptionText) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex
                ? {
                    ...question,
                    options: question.options.map((option, optId) =>
                        optId === optionIndex ? { ...option, option: newOptionText } : option
                    )
                }
                : question
        ))
    }

    const handleCorrectChange = (questionIndex, optionIndex, answerTypeValue) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) => {
            if (key !== questionIndex) return question
            if (answerTypeValue === "single") {
                return {
                    ...question,
                    options: question.options.map((option, idx) => ({
                        ...option,
                        correctAnswer: idx === optionIndex
                    }))
                }
            } else if (answerTypeValue === "multi") {
                return {
                    ...question,
                    options: question.options.map((option, idx) => ({
                        ...option,
                        correctAnswer: idx === optionIndex ? !option.correctAnswer : option.correctAnswer
                    }))
                }
            }
            return question
        }))
    }

    const handleTypeChange = (questionIndex, answerTypeValue) => {
        if (answerTypeValue === "single" || answerTypeValue === "multi") {
            const newOptions = questions[questionIndex].options.map((opt, i) => ({
                option: opt.option,
                correctAnswer: answerTypeValue === "single" ? i === 0 : false
            }))
            setQuestions(prevQuestions => prevQuestions.map((question, key) =>
                key === questionIndex ? { ...question, options: newOptions, answerType: answerTypeValue } : question
            ))
        }
    }

    const handleAddAnswer = (questionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex ? { ...question, options: [...question.options, { option: "", correctAnswer: false }] } : question
        ))
    }

    const handleRemoveAnswer = (questionIndex, optionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) => {
            if (key !== questionIndex) return question
            const updatedOptions = question.options.filter((_, optId) => optId !== optionIndex)
            if (question.answerType === "single" && question.options[optionIndex].correctAnswer && updatedOptions.length > 0) {
                updatedOptions[0] = { ...updatedOptions[0], correctAnswer: true }
            }
            return { ...question, options: updatedOptions }
        }))
    }

    const handleAddQuestion = () => {
        setQuestions(prevQuestions => [
            ...prevQuestions,
            { questionText: "", options: [{ option: "", correctAnswer: true }, { option: "", correctAnswer: false }], answerType: "single" }
        ])
    }

    const handleRemoveQuestion = (questionIndex) => {
        setQuestions(prevQuestions =>
            prevQuestions.length > 1
                ? prevQuestions.filter((_, key) => key !== questionIndex)
                : prevQuestions
        )
    }

    const handleVisibilityChange = (val) => {
        setVisibility(val)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const url = isEdit ? `/api/quizzes/${quiz._id}` : "/api/quizzes"
        const method = isEdit ? "PUT" : "POST"

        try {
            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description, participants, visibility, categories })
            })

            const data = await response.json()

            if (data.status === "success") {
                if (isEdit) {
                    await fetch(`/api/quiz-questions/${quiz._id}`, {
                        method: "DELETE",
                        credentials: 'include',
                    })
                }

                for (let i = 0; i < questions.length; i++) {
                    await fetch("/api/quiz-questions", {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            quizId: data.data._id,
                            questionText: questions[i].questionText,
                            options: questions[i].options,
                            order: i,
                            answerType: questions[i].answerType
                        })
                    })
                }

                toast.success(data.message)
                navigate("/list")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    const getParticipantName = (participant) => {
        return isEdit ? participant.name : participant.option
    }

    return (
        <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">{isEdit ? "Edit Quiz" : "Create New Quiz"}</h1>
                    <p className="text-slate-500 font-medium text-sm">Design a challenge for your friends.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs"
                >
                    <Icons icon="exit" className="w-4 h-4 rotate-180" />
                    <span>Cancel</span>
                </button>
            </div>

            <form name={isEdit ? "editForm" : "createForm"} onSubmit={handleSubmit} className="space-y-6 pb-20">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Icons icon="dashboard" className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black text-slate-800">Basic Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Quiz Title</label>
                            <input
                                id="title"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-bold placeholder-slate-400 transition-all text-sm"
                                placeholder="e.g., Ultimate Science Trivia"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                            <textarea
                                id="description"
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-medium placeholder-slate-400 transition-all resize-none text-sm"
                                placeholder="What is this quiz about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Visibility</label>
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-lg border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => handleVisibilityChange(false)}
                                        className={`flex-1 py-1.5 px-3 rounded-md font-bold text-xs transition-all ${!visibility ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Public
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleVisibilityChange(true)}
                                        className={`flex-1 py-1.5 px-3 rounded-md font-bold text-xs transition-all ${visibility ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Private
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="categories" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categories</label>
                                <select
                                    id="categories"
                                    value=""
                                    onChange={e => handleCategoriesChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 font-bold transition-all text-sm appearance-none"
                                >
                                    <option value="" disabled>Select a category...</option>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold text-xs border border-indigo-100">
                                        <span>{cat}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCategory(cat)}
                                            className="text-indigo-400 hover:text-indigo-900"
                                        >
                                            <Icons icon="bin" className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Private Participants Section */}
                {visibility && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Icons icon="people" className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">Manage Access</h2>
                        </div>

                        <div className="relative mb-4">
                            <input
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-medium placeholder-slate-400 transition-all text-sm"
                                placeholder="Search users by name to invite..."
                                value={participantSearch}
                                onChange={(e) => handleParticipantSearch(e.target.value)}
                                onFocus={() => participantSearch.length > 0 && setShowDropdown(searchResults.length > 0)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            />
                            {showDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto p-1">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors rounded-lg"
                                            onClick={() => handleSelectParticipant(user)}
                                        >
                                            <Avatar size="24px" fontSize="12px" name={user.username} />
                                            <span className="font-bold text-slate-700 text-sm">{user.username}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {participants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {participants.map((p, id) => (
                                    <div key={id} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Avatar size="24px" fontSize="10px" name={getParticipantName(p)} />
                                            <span className="font-bold text-xs text-slate-700">{getParticipantName(p)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleParticipantDelete(id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1.5 rounded-md border border-slate-200 hover:border-red-200"
                                        >
                                            <Icons icon="bin" className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-bold text-sm">
                                No participants invited yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Questions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-black text-slate-800">Questions</h2>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold text-xs">
                            {questions.length} Question{questions.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {questions.map((q, questionId) => (
                        <div key={questionId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative group transition-all hover:shadow-md hover:border-indigo-100">
                            <div className="absolute top-5 left-5 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
                                {questionId + 1}
                            </div>

                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(questionId)}
                                    className="absolute top-5 right-5 text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                                    title="Remove Question"
                                >
                                    <Icons icon="bin" className="w-4 h-4" />
                                </button>
                            )}

                            <div className="ml-10 mb-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Question Text</label>
                                <textarea
                                    className="w-full text-base font-bold text-slate-800 placeholder-slate-300 bg-transparent border-0 border-b border-slate-200 focus:border-indigo-500 focus:ring-0 p-0 pb-2 resize-none transition-colors"
                                    placeholder="What do you want to ask?"
                                    rows={1}
                                    value={q.questionText}
                                    onChange={e => handleQuestionChange(questionId, e.target.value)}
                                    required
                                />
                            </div>

                            <div className="ml-10 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Answer Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange(questionId, "single")}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${q.answerType === "single" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"}`}
                                        >
                                            Single Choice
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange(questionId, "multi")}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${q.answerType === "multi" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"}`}
                                        >
                                            Multiple Choice
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Options</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, optionId) => (
                                            <div
                                                key={optionId}
                                                onClick={() => handleCorrectChange(questionId, optionId, q.answerType)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all group/option cursor-pointer ${opt.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 focus-within:border-indigo-300 hover:border-indigo-100'}`}
                                            >
                                                <button
                                                    type="button"
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${opt.correctAnswer
                                                        ? 'bg-green-500 border-green-500 text-white shadow-sm scale-110'
                                                        : 'border-slate-200 text-transparent hover:border-indigo-300'
                                                        }`}
                                                >
                                                    <Icons icon="check" className="w-3 h-3" />
                                                </button>

                                                <input
                                                    className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder-slate-300 text-sm cursor-text"
                                                    placeholder={`Option ${optionId + 1}`}
                                                    value={opt.option ?? ""}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={e => handleOptionChange(questionId, optionId, e.target.value)}
                                                    required
                                                />

                                                {q.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveAnswer(questionId, optionId)
                                                        }}
                                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/option:opacity-100 cursor-pointer"
                                                    >
                                                        <Icons icon="bin" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {q.options.length < 4 && (
                                            <button
                                                onClick={() => handleAddAnswer(questionId)}
                                                type="button"
                                                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 font-bold transition-all group/add text-sm cursor-pointer"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-slate-100 group-hover/add:bg-indigo-100 flex items-center justify-center transition-colors">
                                                    <Icons icon="plus" className="w-3 h-3" />
                                                </div>
                                                <span>Add Option</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 font-black text-lg transition-all flex items-center justify-center gap-3 group bg-white/50 hover:bg-white cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shadow-sm">
                            <Icons icon="plus" className="w-4 h-4" />
                        </div>
                        Add Another Question
                    </button>
                </div>

                <div className="pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50 pb-4 z-10">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isEdit ? "Save Changes" : "Create Quiz"}
                        <Icons icon="check" className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
