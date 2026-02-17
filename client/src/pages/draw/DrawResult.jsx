import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Avatar from '../../components/Avatar';
import Navigation from '../../components/Navigation';
import Icons from '../../components/Icons';

const TrophyIcon = ({ size = 48, className = "" }) => (
    <Icons icon="trophy" className={className} style={{ width: size, height: size }} />
);

const HomeIcon = ({ size = 20, className = "" }) => (
    <Icons icon="play" className={className} style={{ width: size, height: size }} />
);

const PaletteIcon = ({ size = 20, className = "" }) => (
    <Icons icon="pen" className={className} style={{ width: size, height: size }} />
);

const StaticCanvas = ({ paths }) => {
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-300">
                <Icons icon="pen" className="w-8 h-8 opacity-20" />
            </div>
        );
    }

    // Calculate bounding box of all paths to create a perfect viewBox
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasPoints = false;

    paths.forEach(stroke => {
        if (stroke.paths && Array.isArray(stroke.paths)) {
            stroke.paths.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
                hasPoints = true;
            });
        }
    });

    if (!hasPoints) {
        return (
            <div className="flex items-center justify-center h-full text-slate-300">
                <Icons icon="pen" className="w-8 h-8 opacity-20" />
            </div>
        );
    }

    // Add padding (10%) to the viewBox so the drawing isn't touching the edges
    const width = maxX - minX;
    const height = maxY - minY;
    const paddingX = width * 0.1 || 20;
    const paddingY = height * 0.1 || 20;

    const viewBox = `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${height + paddingY * 2}`;

    return (
        <svg
            viewBox={viewBox}
            className="w-full h-full drop-shadow-sm"
            preserveAspectRatio="xMidYMid meet"
        >
            {paths.map((stroke, i) => (
                <path
                    key={i}
                    d={stroke.paths.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={stroke.strokeColor || '#333'}
                    strokeWidth={stroke.strokeWidth || 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
        </svg>
    );
};

const DrawResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [finalResults, setFinalResults] = useState([]);
    const [drawings, setDrawings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { attemptId } = useParams();

    useEffect(() => {
        if (location.state) {
            if (location.state.results) {
                const sorted = [...location.state.results].sort((a, b) => b.score - a.score);
                const processed = sorted.map((p, index) => ({
                    ...p,
                    rank: index + 1,
                    color: getColorForRank(index + 1)
                }));
                setFinalResults(processed);
            }
            if (location.state.drawings) {
                setDrawings(location.state.drawings);
            }
            setLoading(false);
        } else if (attemptId) {
            fetch(`/api/gameAttempt/id/${attemptId}`, {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        const attempt = data.data.attempt || data.data;
                        const results = attempt.results || [];
                        const sorted = [...results].sort((a, b) => b.score - a.score);
                        const processed = sorted.map((p, index) => ({
                            id: p.user || p.guest,
                            name: p.username,
                            score: p.score || 0,
                            rank: index + 1,
                            color: getColorForRank(index + 1)
                        }));
                        setFinalResults(processed);
                        setDrawings(attempt.drawings || []);
                    } else {
                        console.error("Failed to fetch results:", data.message);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching results:", err);
                    setLoading(false);
                });
        }
    }, [location.state, attemptId]);

    const getColorForRank = (rank) => {
        switch (rank) {
            case 1: return '#4F46E5';
            case 2: return '#EF4444';
            case 3: return '#10B981';
            default: return '#94A3B8';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (finalResults.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800 mb-4">No Results Found</h1>
                    <button onClick={() => navigate('/draw')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Go Home</button>
                </div>
            </div>
        )
    }

    const winners = finalResults.slice(0, 3);
    const others = finalResults.slice(3);

    const getWinner = (rank) => winners.find(w => w.rank === rank);
    const rank1 = getWinner(1);
    const rank2 = getWinner(2);
    const rank3 = getWinner(3);

    return (
        <div className="min-h-screen font-sans text-slate-900 overflow-x-hidden">
            <Navigation />
            <div className="max-w-6xl mx-auto p-6 md:p-12">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 mb-4">
                        <TrophyIcon size={24} className="text-amber-500" />
                        <span className="font-black uppercase tracking-widest text-sm text-slate-500">Game Over</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-2">The Victory Lap</h1>
                    <p className="text-xl font-medium text-slate-400 italic">Who mastered the canvas?</p>
                </div>

                {/* Podium Section */}
                <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-24 h-[400px]">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                        {rank2 && (
                            <>
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border-2 border-slate-100">
                                    <Avatar size="48px" name={rank2.name} />
                                </div>
                                <div className="bg-white rounded-t-[2rem] p-6 w-full text-center border-t border-x border-slate-200 shadow-xl h-48 flex flex-col justify-end">
                                    <span className="text-2xl md:text-3xl font-black text-slate-300 mb-1 leading-none">2nd</span>
                                    <p className="font-bold text-slate-800 text-sm md:text-base truncate">{rank2.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank2.score} PTS</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center">
                        {rank1 && (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">👑</div>
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-white flex items-center justify-center p-1 shadow-2xl shadow-indigo-100 border-4 border-white ring-8 ring-white/50">
                                        <Avatar size="100%" fontSize="40px" name={rank1.name} />
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-10 w-full text-center border-t border-x border-white shadow-xl h-64 flex flex-col justify-end">
                                    <span className="text-4xl md:text-6xl font-black text-indigo-600 mb-2 leading-none">1st</span>
                                    <p className="font-black text-slate-900 text-lg md:text-xl truncate">{rank1.name}</p>
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{rank1.score} PTS</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                        {rank3 && (
                            <>
                                <div className="w-16 h-16 md:w-16 md:h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                                    <Avatar size="40px" name={rank3.name} />
                                </div>
                                <div className="bg-white rounded-t-[2rem] p-6 w-full text-center border-t border-x border-slate-200 shadow-xl h-36 flex flex-col justify-end">
                                    <span className="text-xl md:text-2xl font-black text-slate-200 mb-1 leading-none">3rd</span>
                                    <p className="font-bold text-slate-800 text-xs md:text-sm truncate">{rank3.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank3.score} PTS</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Scoreboard List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-black tracking-tight">Full Leaderboard</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>
                        <div className="space-y-3">
                            {finalResults.map((player) => (
                                <div key={player.id} className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <span className={`w-8 font-black text-lg ${player.rank <= 3 ? 'text-indigo-600' : 'text-slate-300'}`}>#{player.rank}</span>
                                    <Avatar size="40px" name={player.name} />
                                    <span className="flex-1 font-bold text-slate-700">{player.name}</span>
                                    <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                                        <span className="font-black text-slate-800 tabular-nums text-sm">{player.score}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">PTS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center p-12 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

                        <div className="bg-indigo-50 p-4 rounded-3xl mb-6 text-indigo-600">
                            <PaletteIcon size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4">Game Stats</h2>
                        <div className="grid grid-cols-2 gap-8 w-full">
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Rounds</p>
                                <p className="text-4xl font-black text-slate-800">{(location.state?.results?.length || 0) * (drawings.length > 0 ? (drawings.length / location.state?.results.length) : 0) || 0}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Participants</p>
                                <p className="text-4xl font-black text-slate-800">{finalResults.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drawings Gallery Section */}
                {drawings.length > 0 && (
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-amber-100 p-3 rounded-2xl">
                                <PaletteIcon size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black tracking-tight">Gallery of Genius</h2>
                                <p className="text-slate-400 font-medium">Revisit the masterpieces from this game</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {drawings.map((draw, idx) => {
                                let paths = [];
                                try {
                                    paths = typeof draw.canvasData === 'string' ? JSON.parse(draw.canvasData) : draw.canvasData;
                                } catch (e) {
                                    console.error("Failed to parse drawing data", e);
                                }

                                return (
                                    <div key={idx} className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
                                        <div className="relative aspect-video bg-slate-50 border-b border-slate-50">
                                            <div className="absolute inset-0 p-4">
                                                <StaticCanvas paths={paths} />
                                            </div>
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                                                    Turn {idx + 1}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Word</p>
                                                <p className="text-2xl font-black text-slate-800">{draw.word}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Artist</span>
                                                    <span className="text-xs font-bold text-slate-600">{draw.drawer.username}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight">Guesser</span>
                                                    <span className="text-xs font-bold text-slate-600 italic">
                                                        {draw.firstGuesser?.username || 'No one'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/draw')}
                    className="mx-auto px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-200 transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                    <HomeIcon />
                    New Game
                </button>
            </div>
        </div>
    );
};

export default DrawResult;

