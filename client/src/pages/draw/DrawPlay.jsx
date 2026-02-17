import { useState, useEffect, useRef } from 'react';
import Avatar from '../../components/Avatar';
import Icons from '../../components/Icons';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';

const DrawPlay = ({ gameData, socket }) => {
    const navigate = useNavigate();
    const myUserId = gameData.userId;
    const initialSession = gameData.session;

    const [session, setSession] = useState(initialSession);
    const [players, setPlayers] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [messages, setMessages] = useState([]);
    const [wordChoices, setWordChoices] = useState([]);
    const [isChoosing, setIsChoosing] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [selectedSize, setSelectedSize] = useState(8);
    const [isEraser, setIsEraser] = useState(false);

    const chatEndRef = useRef(null);
    const canvasRef = useRef(null);
    const canvasWrapperRef = useRef(null);

    const currentDrawer = session.gameData?.currentDrawer || {};
    const currentDrawerId = currentDrawer.user || currentDrawer.guest;
    const isDrawer = String(currentDrawerId) === String(myUserId);
    const lastDrawerIdRef = useRef(currentDrawerId);
    const isSelectionPendingRef = useRef(false);


    useEffect(() => {
        if (!gameData || !socket) return;

        socket.emit("join-room", { code: String(initialSession.roomCode) });

        // Initialize players list based on initial state
        const initialResults = initialSession.participants[0]?.attemptId?.results || [];
        setPlayers(initialResults.map(p => ({
            id: p.user || p.guest,
            name: p.username,
            score: p.score || 0,
            isDrawing: (p.user && String(p.user) === String(initialSession.gameData?.currentDrawer?.user)) ||
                (p.guest && p.guest === initialSession.gameData?.currentDrawer?.guest)
        })));

        socket.on('draw-status-update', (data) => {
            const newDrawerId = data.session.currentDrawer?.user || data.session.currentDrawer?.guest;

            // Handle drawer change (automatic canvas clear and word choosing reset)
            if (lastDrawerIdRef.current && String(lastDrawerIdRef.current) !== String(newDrawerId)) {
                canvasRef.current?.clearCanvas();
                setIsChoosing(false);
                isSelectionPendingRef.current = false; // Reset on turn change
            }
            lastDrawerIdRef.current = newDrawerId;

            setSession(prev => ({
                ...prev,
                status: data.session.status,
                gameData: {
                    ...prev.gameData,
                    ...data.session // Ensure all game fields like currentWord are updated
                }
            }));

            setTimeRemaining(data.session.timeRemaining);

            if (data.results) {
                setPlayers(data.results.map(p => ({
                    id: p.user || p.guest,
                    name: p.username,
                    score: p.score || 0,
                    isDrawing: (p.user && String(p.user) === String(newDrawerId)) ||
                        (p.guest && p.guest === newDrawerId)
                })));
            }
        });

        socket.on('new-guess', (incomingMessage) => {
            setMessages(prev => [...prev, { ...incomingMessage, id: incomingMessage.id || Date.now() }]);
        });

        socket.on('game-finished', (data) => {
            const results = data.results || [];
            const finalResults = results.map(p => ({
                id: p.user || p.guest,
                name: p.username,
                score: p.score || 0
            }));
            const attemptId = data.attemptId || (results[0]?.attemptId);
            navigate(`/draw/result/${attemptId}`, {
                state: {
                    results: finalResults,
                    drawings: data.drawings || []
                }
            });
        });

        socket.on('canvas-initial-load', (paths) => {
            if (canvasRef.current) {
                canvasRef.current.clearCanvas();
                canvasRef.current.loadPaths(paths);
            }
        });

        // Handle incremental strokes
        socket.on('draw-stroke', (stroke) => {
            if (!isDrawer && canvasRef.current) {
                canvasRef.current.loadPaths([stroke]);
            }
        });

        // Fallback or full sync if needed
        socket.on('draw-data', (paths) => {
            if (!isDrawer && canvasRef.current) {
                canvasRef.current.loadPaths(paths);
            }
        });

        socket.on('canvas-clear', () => {
            if (!isDrawer) {
                canvasRef.current?.clearCanvas();
            }
        });

        return () => {
            socket.off('draw-status-update');
            socket.off('new-guess');
            socket.off('game-finished');
            socket.off('canvas-initial-load');
            socket.off('draw-stroke');
            socket.off('draw-data');
            socket.off('canvas-clear');
        };
    }, [gameData, socket, initialSession, navigate]); // Removed currentDrawer/isDrawer dependencies

    // Reset isChoosing when a word is confirmed by the server
    useEffect(() => {
        if (session.gameData?.currentWord) {
            setIsChoosing(false);
            isSelectionPendingRef.current = false; // Selection confirmed
        }
    }, [session.gameData?.currentWord]);

    // Local timer countdown for smooth UI
    useEffect(() => {
        if (session.status !== 'in-progress') return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [session.status, lastDrawerIdRef.current, session.gameData?.currentWord]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const hasWord = session.gameData?.currentWord;
        if (isDrawer && !hasWord && !isChoosing && !isSelectionPendingRef.current) {
            fetchWords();
        }
    }, [isDrawer, session.gameData?.currentWord, isChoosing]);

    async function fetchWords() {
        if (isChoosing || session.gameData?.currentWord) return;
        setIsChoosing(true);
        try {
            const response = await fetch(`/api/gameSession/draw/words?roomCode=${session.roomCode}`);
            const result = await response.json();
            if (result.status === 'success') {
                setWordChoices(result.data);
            } else {
                setWordChoices(['Apple', 'Tree', 'House']);
            }
        } catch (err) {
            setWordChoices(['Apple', 'Tree', 'House']);
        }
    }

    function handleSelectWord(word) {
        if (!isChoosing) return;
        setIsChoosing(false);
        isSelectionPendingRef.current = true; // Block subsequent fetches until server update
        socket.emit('draw-select-word', { code: String(session.roomCode), word: word });
    }

    function handleSendMessage(e) {
        if (e) {
            e.preventDefault();
        }

        if (!message.trim()) {
            return;
        }

        const myParticipant = session.participants.find(p => {
            const participantId = p.user || p.guest;
            return String(participantId) === String(myUserId);
        });
        const myUsername = myParticipant?.username || "Unknown";

        socket.emit('draw-message', {
            code: String(session.roomCode),
            text: message,
            userId: myUserId,
            username: myUsername
        });

        setMessage("");
    }

    function handleStroke(stroke) {
        if (!isDrawer) {
            return;
        }

        socket.emit('draw-stroke', { code: String(session.roomCode), stroke });
    }

    function handleClearCanvas() {
        if (!isDrawer) {
            return;
        }

        canvasRef.current?.clearCanvas();
        socket.emit('canvas-clear', { code: String(session.roomCode) });
    }

    const colors = ['#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#78350F'];
    const brushSizes = [4, 8, 12, 20];

    const currentWord = session.gameData?.currentWord || "";
    const wordHint = currentWord.split('').map((char, index) => {
        if (isDrawer) {
            return char;
        }
        if (index === 0) {
            return char;
        }
        return '_';
    });

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col p-4 md:p-6 lg:p-8 gap-6 max-h-[calc(100vh-64px)] overflow-hidden">
            <header className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                        <Icons icon="pen" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Drawing Game</h1>
                        <p className="text-xs text-slate-400 font-bold">Room: {session.roomCode}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Round</p>
                        <p className="text-2xl font-black text-indigo-600">
                            {session.gameData?.currentRound || 1}
                            <span className="text-xs text-slate-300 ml-1">
                                / {(players.length || 1) * (session.gameData?.settings?.rounds || 1)}
                            </span>
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Time</p>
                        <p className="text-2xl font-black text-indigo-600">{timeRemaining}s</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Word</p>
                        <p className="text-lg font-black text-slate-800 tracking-wider">{wordHint.join(' ')}</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-3 xl:col-span-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-[2rem] p-6 overflow-hidden flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Players</h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {players.map((player) => (
                            <div key={player.id} className={`p-4 rounded-2xl transition-all ${player.isDrawing ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50 border-2 border-transparent'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar size="32px" fontSize="14px" name={player.name} />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800">{player.name}</p>
                                        {player.isDrawing && <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Drawing</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-bold text-slate-400">Score</span>
                                    <span className="text-lg font-black text-indigo-600">{player.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
                    {isDrawer && isChoosing && (
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.5rem] p-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-2xl">
                                        <Icons icon="pen" className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Pick a word</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your turn to draw!</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {wordChoices.map((word) => (
                                        <button
                                            key={word}
                                            onClick={() => handleSelectWord(word)}
                                            className="bg-slate-50 hover:bg-indigo-600 hover:text-white border-2 border-slate-100/50 p-4 px-8 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={canvasWrapperRef} className={`aspect-video w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-[12px] border-white relative overflow-hidden group ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}>
                        <div className="absolute top-4 left-4 z-10">
                            <div className="bg-white/90 backdrop-blur-md pl-2 pr-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                                <Avatar size="20px" fontSize="10px" name={currentDrawer.username || 'System'} />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    {isDrawer ? 'You are drawing' : `${currentDrawer.username} is drawing`}
                                </span>
                            </div>
                        </div>

                        <div className="absolute inset-0 z-0">
                            <ReactSketchCanvas
                                ref={canvasRef}
                                strokeColor={isEraser ? '#FFFFFF' : selectedColor}
                                strokeWidth={selectedSize}
                                eraserWidth={selectedSize}
                                onStroke={handleStroke}
                                readOnly={!isDrawer}
                                width="100%"
                                height="100%"
                                canvasColor="#FFFFFF"
                                style={{ border: 'none', pointerEvents: isDrawer ? 'auto' : 'none' }}
                            />
                        </div>

                        {isDrawer && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl p-4 px-6 rounded-3xl shadow-2xl border border-white/40 flex items-center gap-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="flex gap-2 pr-6 border-r border-slate-100">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-6 h-6 rounded-lg transition-transform hover:scale-125 shadow-sm border-2 ${selectedColor === color ? 'border-white ring-2 ring-indigo-500' : 'border-white'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    {brushSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`group relative flex items-center justify-center transition-all ${selectedSize === size ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                                        >
                                            <div className={`rounded-full bg-current transition-all ${selectedSize === size ? 'scale-110' : ''}`} style={{ width: size / 2 + 4, height: size / 2 + 4 }} />
                                            {selectedSize === size && <div className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        onClick={() => setIsEraser(!isEraser)}
                                        className={`p-2 rounded-xl transition-colors ${isEraser ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
                                    >
                                        <Icons icon="eraser" className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleClearCanvas}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                                    >
                                        <Icons icon="bin" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 overflow-hidden">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-[2rem] p-6 flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Game Feed</h2>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`p-3 rounded-2xl ${msg.type === 'success' ? 'bg-emerald-50 border-2 border-emerald-200' : msg.type === 'system' ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50'}`}>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{msg.user}</p>
                                    <p className="text-sm font-bold text-slate-800">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your guess..."
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 font-bold text-sm"
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawPlay;
