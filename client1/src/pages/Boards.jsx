import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import InlineSpinner from "../components/InlineSpinner";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

function Boards() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchBoards = async () => {
        try {
            const res = await API.get("/boards");
            setBoards(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load boards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        try {
            const res = await API.post("/boards", { title: newTitle });
            setBoards((prev) => [res.data, ...prev]);
            setNewTitle("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create board");
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const filteredBoards = boards.filter((board) =>
        board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-paper font-sans">
            <header className="border-b border-line bg-surface">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-accent rounded-sm flex items-center justify-center">
                            <div className="h-2.5 w-2.5 bg-paper rounded-[2px]" />
                        </div>
                        <span className="font-display font-semibold text-lg text-ink">
                            Taskboard
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-ink/60 hover:text-ink transition-colors"
                    >
                        Log out
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display font-semibold text-2xl text-ink">
                        Your boards
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <form onSubmit={handleCreateBoard} className="flex gap-2 flex-1">
                        <input
                            type="text"
                            placeholder="Name a new board…"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="flex-1 border border-line bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                        >
                            {creating && <InlineSpinner />}
                            {creating ? "Creating" : "New board"}
                        </button>
                    </form>

                    {boards.length > 0 && (
                        <input
                            type="text"
                            placeholder="Search…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-line bg-surface rounded-md px-3 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        />
                    )}
                </div>

                <Toast message={error} onClose={() => setError("")} />

                {loading && <Spinner size="lg" />}

                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredBoards.length === 0 ? (
                            <div className="col-span-full border border-dashed border-line rounded-lg py-12 text-center">
                                <p className="text-ink/50 text-sm">
                                    {boards.length === 0
                                        ? "No boards yet — create one above to get started."
                                        : "No boards match your search."}
                                </p>
                            </div>
                        ) : (
                            filteredBoards.map((board) => (
                                <div
                                    key={board._id}
                                    onClick={() => navigate(`/boards/${board._id}`)}
                                    className="bg-surface border border-line border-l-4 border-l-accent rounded-md p-4 cursor-pointer hover:border-l-accent hover:shadow-sm transition-shadow"
                                >
                                    <h2 className="font-display font-medium text-ink mb-1">
                                        {board.title}
                                    </h2>
                                    <p className="text-xs text-ink/50">
                                        {board.members?.length || 1} member
                                        {(board.members?.length || 1) !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Boards;
