import { useState, useEffect } from "react"
import Navigation from "../components/Navigation.jsx"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import Icons from "../components/Icons.jsx"
import Avatar from "../components/Avatar.jsx"
import categoryOptions from "../utils/Categories.json"

export default function EditQuiz() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [visibility, setVisibility] = useState(false)
    const [questions, setQuestions] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0])
    const [participants, setParticipants] = useState([])
    const [participantSearch, setParticipantSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()
    const {quizId} = useParams()
    useEffect(() => {
        fetch(`/api/quizzes/${quizId}`, {
            credentials: "include",
        }).then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                setTitle(data.data.quiz.title)
                setDescription(data.data.quiz.description)
                setVisibility(data.data.quiz.visibility)
                setQuestions(data.data.quizQuestions.map(quest => ({
                    questionText: quest.questionText,
                    options: quest.options,
                    answerType: quest.answerType
                })))
                setParticipants(data.data.quiz.participants)
                setCategories(data.data.quiz.categories)
            } else {
                toast.error(data.message)
                navigate("/list")
            }
        })
    }, [])

    const handleCategoriesChange = (value) => {
        setSelectedCategory(value)
    }

    const handleAddCategory = () => {
        if (!categories.includes(selectedCategory)) {
            setCategories(prev => [...prev, selectedCategory])
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
                    // Filter out already added participants
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
        setParticipants(prev => [...prev, { name: user.username, user: user._id }])
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
        setQuestions(prevQuestions => prevQuestions.map((question, key) => {
            if (key !== questionIndex) return question
            let newOptions = question.options.map((opt, i) => ({
                option: opt.option,
                correctAnswer: answerTypeValue === "single" ? i === 0 : false
            }))
            return { ...question, options: newOptions, answerType: answerTypeValue }
        }))
    }

    const handleAddAnswer = (questionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) =>
            key === questionIndex
                ? { ...question, options: [...question.options, { option: "", correctAnswer: false }] }
                : question
        ))
    }

    const handleRemoveAnswer = (questionIndex, optionIndex) => {
        setQuestions(prevQuestions => prevQuestions.map((question, key) => {
            if (key !== questionIndex) return question
            const updatedOptions = question.options.filter((_, optId) => optId !== optionIndex)
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

    const handleVisibilityChange = (e) => {
        setVisibility(() => (e.target.name === "public" ? false : true) )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        fetch(`/api/quizzes/${quizId}`, {
            method: "PUT",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, description, participants, visibility, categories })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                fetch(`/api/quiz-questions/${quizId}`, {
                    method: "DELETE",
                    credentials: 'include',
                }).then(res => res.json())
                .then(deleteData => {
                    if (deleteData.status == "success") {
                        for (let i = 0; i < questions.length; i++) {
                            fetch("/api/quiz-questions", {
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
                            }).then(res => res.json())
                            .then(data => {
                                if (data.status == "error") {
                                    toast.error(data.message)
                                }
                            })
                        }
                        toast.success(data.message)
                        navigate("/list")
                    } else if (data.status == "error")  {
                        toast.error(data.message)
                    } else {
                        toast(data.message)
                    }
                })
            } else if (data.status == "error")  {
                toast.error(data.message)
            } else {
                toast(data.message)
            }
        })
    }

    return (
        <main className="min-h-screen">
            <Navigation />
            <div className="max-w-5xl mx-auto mt-5 flex flex-col bg-white text-gray-700 rounded shadow-sm p-5">
                <h2 className="text-2xl font-bold mb-4">Edit Quiz</h2>
                <form name="editForm" onSubmit={handleSubmit}>
                    <div className="w-full bg-white rounded shadow-sm p-5 mb-5">
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                        <input
                            id="title"
                            className="border border-gray-300 rounded p-2 mb-2 w-full"
                            placeholder="Enter quiz title"
                            value={title}
                            onChange={(e) => (setTitle(e.target.value))}
                            required
                        />
                        <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            className="border border-gray-300 rounded p-2 mb-4 w-full"
                            placeholder="Enter quiz description"
                            value={description}
                            onChange={(e) => (setDescription(e.target.value))}
                        />
                        <div className="flex gap-3 mb-2">
                            <label htmlFor="publicVisibility">
                                <input onChange={handleVisibilityChange} checked={!visibility} value={!visibility} className="mr-1" type="radio" name="public" id="publicVisibility"/>
                                Public
                            </label>
                            <label htmlFor="privateVisibility">
                                <input onChange={handleVisibilityChange} checked={visibility} value={visibility} className="mr-1" type="radio" name="private" id="privateVisibility"/>
                                Private
                            </label>
                        </div>
                        {visibility && 
                            <>
                                <div className="relative w-full">
                                    <label htmlFor="participants" className="block text-sm font-medium mb-2">Add participants
                                        <input
                                            id="participants"
                                            className="border border-gray-300 rounded p-2 mb-2 w-full mt-2"
                                            placeholder="Start typing participant name..."
                                            value={participantSearch}
                                            onChange={(e) => handleParticipantSearch(e.target.value)}
                                            onFocus={() => participantSearch.length > 0 && setShowDropdown(searchResults.length > 0)}
                                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        />
                                    </label>
                                    {showDropdown && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-10 max-h-60 overflow-y-auto">
                                            {searchResults.map((user) => (
                                                <div
                                                    key={user._id}
                                                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                    onClick={() => handleSelectParticipant(user)}
                                                >
                                                    <Avatar size="30px" fontSize="15px" name={user.username} />
                                                    <span>{user.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium mb-2">Participant list</p>
                                <div className="border border-gray-300 rounded p-2 mb-2">
                                    {participants.length === 0 ?
                                        <p>None</p>
                                        :
                                        <div className="flex gap-1">
                                        {participants.map((p,id) => (
                                            <div key={id} className="flex gap-1 px-2 py-1 bg-white shadow-sm border-1 border-gray-200 rounded w-fit">
                                                <Avatar size="30px" fontSize="15px" name={p.name} />
                                                <p>{p.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleParticipantDelete(id)}
                                                    className="ml-2 text-red-500 hover:text-red-700 w-5 cursor-pointer h-full"
                                                >
                                                    <Icons icon="bin" className="w-5 my-auto"/>
                                                </button>
                                            </div>
                                        ))}
                                        </div>
                                    }
                                </div>
                            </>
                        }
                        <div className="flex flex-col mb-4">
                            <label htmlFor="categories" className="text-sm font-medium mb-2">Categories</label>
                            <div className="flex gap-2">
                                <select
                                    id="categories"
                                    value={selectedCategory}
                                    onChange={e => handleCategoriesChange(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded"
                                >
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="flex items-center cursor-pointer space-x-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                >
                                    <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                                    <span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {categories.length > 0 &&
                                    categories.map(cat => (
                                        <div key={cat} className="flex items-center align-middle border-1 border-gray-300 bg-gray-100 px-3 py-1 rounded-full">
                                            <span>{cat}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCategory(cat)}
                                                className="ml-2 text-red-500 hover:text-red-700 w-4 cursor-pointer"
                                                title="Remove"
                                            >
                                                <Icons icon="bin" />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        {questions && questions.map((q, questionId) => (
                            <div key={questionId} className="block text-sm font-medium mb-2 bg-white shadow-sm rounded p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="mb-2">Question {questionId + 1}</span>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveQuestion(questionId)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm border-1 rounded px-2 py-1">
                                            Remove Question
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    name="questionDescription"
                                    className="border border-gray-300 rounded p-2 mb-4 w-full"
                                    placeholder="Enter your question"
                                    rows={2}
                                    value={q.questionText}
                                    onChange={e => handleQuestionChange(questionId, e.target.value)}
                                    required
                                />
                                <div className="mb-4">
                                    <label htmlFor={`selectType-${questionId}`} className="block text-sm font-medium mb-2">Question Type</label>
                                    <select
                                        id={`selectType-${questionId}`}
                                        onChange={e => handleTypeChange(questionId, e.target.value)}
                                        value={q.answerType}
                                        className="px-4 py-2 border border-gray-300 rounded"
                                    >
                                        <option value="single">Single Answer</option>
                                        <option value="multi">Multiple Answers</option>
                                        {/*<option value="connection">Connection/Matching</option>*/}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2 h-8">
                                    <span>Answer Options</span>
                                    {q.options.length < 4 &&
                                        <button
                                            onClick={() => handleAddAnswer(questionId)}
                                            type="button"
                                            className="flex items-center cursor-pointer space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                        >
                                        <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                                        <span>Add Option</span>
                                        </button>
                                    }
                                </div>
                                {q.options.map((opt, optionId) => (
                                    <div key={optionId} className="flex items-center mb-2">
                                        <input
                                            name="correctAnswerCheckbox"
                                            type="checkbox"
                                            className="mr-2 w-3.5 h-3.5"
                                            checked={opt.correctAnswer}
                                            onChange={() => handleCorrectChange(questionId, optionId, q.answerType)}
                                        />
                                        <input
                                            name="optionInput"
                                            className="border border-gray-300 rounded p-2 flex-1"
                                            placeholder={`Option ${optionId + 1}`}
                                            value={opt.option ?? ""}
                                            onChange={e => handleOptionChange(questionId, optionId, e.target.value)}
                                            required
                                        />
                                        {q.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAnswer(questionId, optionId)}
                                                className="ml-2 text-red-500 hover:text-red-700 w-5 h-5 cursor-pointer"
                                            >
                                            <Icons icon="bin" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="border-2 border-dotted cursor-pointer border-gray-500 rounded p-2 mb-4 w-full flex items-center justify-center"
                        >
                            <Icons icon="plus" className="w-4 h-4 inline-block mr-1" />
                            Add Question
                        </button>
                    </div>
                    <button type="submit" className="bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer text-white px-4 py-2 w-full rounded font-bold">
                        Save changes
                    </button>
                </form>
            </div>
        </main>
    )
}