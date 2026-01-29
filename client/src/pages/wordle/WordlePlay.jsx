export default function WordleGame() {
    const rows = 6;
    const cols = 5;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4">
            {/* Header */}
            <header className="w-full flex items-center justify-between max-w-md mb-4">
                <button className="text-xl">?</button>
                <h1 className="text-2xl font-bold tracking-widest">WORDLE</h1>
                <button className="text-xl">⚙</button>
            </header>

            {/* Game Grid */}
            <div className="grid grid-rows-6 gap-2">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="grid grid-cols-5 gap-2">
                        {Array.from({ length: cols }).map((_, c) => (
                            <div
                                key={c}
                                className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center text-xl font-bold uppercase"
                            >
                                {/* letter goes here */}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Keyboard */}
            <div className="w-full max-w-md mt-6">
                {[
                    "QWERTYUIOP",
                    "ASDFGHJKL",
                    "ZXCVBNM",
                ].map((row, i) => (
                    <div key={i} className="flex justify-center gap-1 mb-2">
                        {row.split("").map((key) => (
                            <button
                                key={key}
                                className="flex-1 max-w-[40px] h-12 bg-gray-200 rounded font-semibold"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                ))}

                {/* Enter / Backspace */}
                <div className="flex justify-center gap-2">
                    <button className="px-4 h-12 bg-gray-300 rounded font-semibold">
                        Enter
                    </button>
                    <button className="px-4 h-12 bg-gray-300 rounded font-semibold">
                        ⌫
                    </button>
                </div>
            </div>
        </div>
    );
}
