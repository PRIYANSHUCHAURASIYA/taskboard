import { useState } from "react";
import API from "../api/axios";
import InlineSpinner from "./InlineSpinner";

function InviteModal({ boardId, onClose, onInvited }) {
    const [email, setEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInvite = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setInviting(true);
        try {
            const res = await API.post(`/boards/${boardId}/invite`, { email });
            onInvited(res.data);
            setSuccess(`${email} added to the board`);
            setEmail("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to invite user");
        } finally {
            setInviting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-lg p-6 w-full max-w-sm font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-display font-semibold text-lg text-ink">Invite a member</h2>
                    <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-md px-3 py-2 mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-accent-soft border border-accent/20 text-accent text-sm rounded-md px-3 py-2 mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleInvite}>
                    <label className="block text-sm font-medium text-ink mb-1.5">Email address</label>
                    <input
                        type="email"
                        placeholder="teammate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-line rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                    <button
                        type="submit"
                        disabled={inviting}
                        className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {inviting && <InlineSpinner />}
                        {inviting ? "Inviting" : "Send invite"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default InviteModal;
