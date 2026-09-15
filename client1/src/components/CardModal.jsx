import { useState, useEffect } from "react";
import API from "../api/axios";
import InlineSpinner from "./InlineSpinner";
import { getCurrentUserId } from "../utils/auth";

function CardModal({ card, members = [], onClose, onUpdated, onDeleted }) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [dueDate, setDueDate] = useState(
        card.dueDate ? card.dueDate.slice(0, 10) : ""
    );
    const [assignee, setAssignee] = useState(card.assignee || "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await API.get(`/api/comments/card/${card._id}`);
                setComments(res.data);
            } catch (err) {
                // silently ignore for now, non-critical to the modal
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, [card._id]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPostingComment(true);
        try {
            const res = await API.post("/api/comments", {
                text: newComment,
                cardId: card._id,
            });
            setComments((prev) => [...prev, res.data]);
            setNewComment("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post comment");
        } finally {
            setPostingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await API.delete(`/api/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await API.put(`/api/cards/${card._id}`, {
                title,
                description,
                dueDate: dueDate || null,
                assignee: assignee || null,
            });
            onUpdated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save card");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError("");
        try {
            await API.delete(`/api/cards/${card._id}`);
            onDeleted(card._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete card");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Edit Card</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4"
                />

                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border rounded px-3 py-2 mb-4"
                />

                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4"
                />

                <label className="block text-sm font-medium mb-1">Assignee</label>
                <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-6"
                >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                        <option key={m._id} value={m._id}>
                            {m.name} ({m.email})
                        </option>
                    ))}
                </select>

                <div className="flex justify-between mb-6">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-600 hover:underline disabled:opacity-50"
                    >
                        {deleting ? "Deleting..." : "Delete Card"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <InlineSpinner />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <hr className="mb-4" />

                <h3 className="text-sm font-semibold mb-3">Comments</h3>

                {loadingComments ? (
                    <p className="text-xs text-gray-400 mb-3">Loading comments...</p>
                ) : (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                        {comments.length === 0 && (
                            <p className="text-xs text-gray-400">No comments yet</p>
                        )}
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-gray-50 rounded p-2 text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-medium text-xs">
                                            {comment.author?.name || "Unknown"}
                                        </span>
                                        <p>{comment.text}</p>
                                    </div>
                                    {comment.author?._id === currentUserId && (
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="text-xs text-red-500 hover:underline ml-2"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={postingComment}
                        className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {postingComment ? <InlineSpinner /> : "Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CardModal;
