import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ConfirmDialog from "./ConfirmDialog";

function BoardSettingsMenu({ board, onRenamed }) {
    const [open, setOpen] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(board?.title || "");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRename = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const res = await API.put(`/boards/${board._id}`, { title: newTitle });
            onRenamed(res.data);
            setRenaming(false);
            setOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to rename board");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/boards/${board._id}`);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete board");
            setDeleting(false);
            setConfirmOpen(false);
            setOpen(true);
        }
    };

    return (
        <div className="relative font-sans">
            <button
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Board settings"
                className="text-ink/50 hover:text-ink px-2 py-1 rounded-md border border-line hover:border-ink/30 transition-colors"
            >
                ⋯
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-line rounded-lg shadow-lg p-3 z-20">
                        {error && <p className="text-danger text-xs mb-2">{error}</p>}

                        {renaming ? (
                            <form onSubmit={handleRename} className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="border border-line rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="text-sm bg-accent text-white px-2 py-1 rounded-md hover:bg-accent/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRenaming(false)}
                                        className="text-sm text-ink/50 hover:text-ink transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setRenaming(true)}
                                className="block w-full text-left text-sm px-2 py-1.5 hover:bg-paper rounded-md text-ink transition-colors"
                            >
                                Rename board
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setOpen(false);
                                setConfirmOpen(true);
                            }}
                            className="block w-full text-left text-sm px-2 py-1.5 hover:bg-danger/10 text-danger rounded-md mt-1 transition-colors"
                        >
                            Delete board
                        </button>
                    </div>
                </>
            )}

            {confirmOpen && (
                <ConfirmDialog
                    title="Delete this board?"
                    message={`"${board.title}" and all of its lists, cards, and comments will be permanently deleted.`}
                    confirmLabel="Delete board"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}
        </div>
    );
}

export default BoardSettingsMenu;
