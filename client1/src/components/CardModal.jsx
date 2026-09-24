import { useState, useEffect } from "react";
import API from "../api/axios";
import InlineSpinner from "./InlineSpinner";
import { getCurrentUserId } from "../utils/auth";

function CardModal({ card, members = [], onClose, onUpdated, onDeleted }) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : "");
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
                const res = await API.get(`/comments/card/${card._id}`);
                setComments(res.data);
            } catch (err) {
                // non-critical
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
            const res = await API.post("/comments", { text: newComment, cardId: card._id });
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
            await API.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await API.put(`/cards/${card._id}`, {
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
            await API.delete(`/cards/${card._id}`);
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
            className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-display font-semibold text-lg text-ink">Card details</h2>
                    <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-md px-3 py-2 mb-4">
                        {error}
                    </div>
                )}

                <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-line rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />

                <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-line rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Due date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Assignee</label>
                        <select
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between mb-6">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-danger text-sm font-medium hover:underline disabled:opacity-50"
                    >
                        {deleting ? "Deleting…" : "Delete card"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <InlineSpinner />}
                        {saving ? "Saving" : "Save changes"}
                    </button>
                </div>

                <div className="border-t border-line pt-4">
                    <h3 className="text-sm font-medium text-ink mb-3">Comments</h3>

                    {loadingComments ? (
                        <p className="text-xs text-ink/40 mb-3">Loading…</p>
                    ) : (
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                            {comments.length === 0 && (
                                <p className="text-xs text-ink/40">No comments yet</p>
                            )}
                            {comments.map((comment) => (
                                <div key={comment._id} className="bg-paper rounded-md p-2.5 text-sm">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="font-medium text-xs text-ink/70">
                                                {comment.author?.name || "Unknown"}
                                            </span>
                                            <p className="text-ink">{comment.text}</p>
                                        </div>
                                        {comment.author?._id === currentUserId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-xs text-danger hover:underline whitespace-nowrap"
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
                            placeholder="Add a comment…"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        />
                        <button
                            type="submit"
                            disabled={postingComment}
                            className="bg-accent text-white px-3 py-2 rounded-md text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center"
                        >
                            {postingComment ? <InlineSpinner /> : "Post"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
