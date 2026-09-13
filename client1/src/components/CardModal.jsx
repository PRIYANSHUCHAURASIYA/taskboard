import { useState } from "react";

import API from "../api/axios";
function CardModal({card , onClose , onUpdated , onDeleted }) {
    const [ title , setTitle] = useState(card.title);
    const [ description , setDescription] = useState(card.description || "");
    const [dueDate , setDueDate] = useState(
        card.dueDate ? card.dueDate.slice(0 , 10) : ""
    );

    const [ saving , setSaving ] = useState(false);
    const [deleting , setDeleting ] = useState(false);
    const [error , setError] = useState("");

    const handleSave = async () =>{
        setSaving(true);
        setError("");
        try{
            const res = await API.post(`/api/cards/${card._id}` , {
                title,
                description,
                dueDate : dueDate || null
            });
            onUpdated(res.data);
            onClose();
        }catch(err){
            setError(err.response?.data?.message || "Failed to save ")
        }finally{
            setSaving(false)
        }
    } ;

    const handleDelete = async () =>{
        setDeleting(true);
        setError("");
        try{
            const res = await API.delete(`/api/cards/${card._id}`);
            onDeleted(card._id);
            onClose();
        }catch(err){
            setError(err.response?.data?.message || "Failed to delete card")
        }finally{
            setDeleting(false);
        }
    };

     return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Edit Card</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
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
                    className="w-full border rounded px-3 py-2 mb-6"
                />

                <div className="flex justify-between">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
