import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function BoardSettingsMenu({ board, onRenamed }) {
    const [open, setOpen] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(board?.title || "");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRename = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const res = await API.put(`/api/boards/${board._id}`, { title: newTitle });
            onRenamed(res.data);
            setRenaming(false);
            setOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to rename board");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${board.title}"? This can't be undone.`
        );
        if (!confirmed) return;

        setDeleting(true);
        try {
            await API.delete(`/api/boards/${board._id}`);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete board");
            setDeleting(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded border"
            >
                ⋯
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-3 z-10">
                    {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

                    {renaming ? (
                        <form onSubmit={handleRename} className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRenaming(false)}
                                    className="text-sm text-gray-500 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setRenaming(true)}
                            className="block w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
                        >
                            Rename board
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="block w-full text-left text-sm px-2 py-1 hover:bg-red-50 text-red-600 rounded mt-1 disabled:opacity-50"
                    >
                        {deleting ? "Deleting..." : "Delete board"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default BoardSettingsMenu;
