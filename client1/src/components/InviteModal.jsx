import { useState } from "react";
import API from "../api/axios";
import InlineSpinner from "./InlineSpinner";

function InviteModal({ boardId , onClose , onInvited}) {
    const [email , setEmail ] = useState("");
    const [inviting , setInviting ] = useState(false);
    const [error , setError] = useState("");
    const [success , setSuccess] = useState("");

    const handleInvite = async (e) =>{
        e.preventDefault();
        setError("");
        setSuccess("");
        setInviting(true);
        try{
            const res = await API.post(`/boards/${boardId}/invite` , { email });
            onInvited(res.data);
            setSuccess(`${email} added to the board`);
            setError("");
        }catch(err){
            setError(err.response?.data?.message || "Failed to invite user");
        }finally{
            setInviting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center  justify-center z-50"
            onClick={onClose}>
                <div
                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Invite Member</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600">
                                    x
                                </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

                        <form onSubmit={handleInvite}>
                            <input
                                type="email"
                                placeholder="Member's email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2 mb-4">
                            </input>
                            <button
                                type="submit"
                                disabled={inviting}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                                    {inviting && <InlineSpinner />}
                                    {inviting ? "Inviting..." : "Invite"}
                                </button>
                        </form>
                    </div>
            </div>
    );
}

export default InviteModal;
