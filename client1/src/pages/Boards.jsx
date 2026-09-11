import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Boards() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    const fetchBoards = async () => {
        try {
            const res = await API.get("/api/boards");
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
            const res = await API.post("/api/boards", { title: newTitle });
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

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Boards</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <form onSubmit={handleCreateBoard} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="New Board title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {creating ? "Creating..." : "Create Board"}
                </button>
            </form>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <p>Loading boards...</p>}

            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boards.length === 0 ? (
                        <p className="text-gray-500 col-span-full">
                            No boards yet. Create your first one above!
                        </p>
                    ) : (
                        boards.map((board) => (
                            <div
                                key={board._id}
                                onClick={() => navigate(`/boards/${board._id}`)}
                                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                            >
                                <h2 className="font-semibold">{board.title}</h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    {board.members?.length || 1} member(s)
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Boards;
