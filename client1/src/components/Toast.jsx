import { useEffect } from "react";

function Toast({ message, type = "error", onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const styles =
        type === "error"
            ? "bg-red-50 border-red-300 text-red-700"
            : "bg-green-50 border-green-300 text-green-700";

    return (
        <div
            className={`fixed top-4 right-4 border rounded-lg shadow-lg px-4 py-3 text-sm z-50 ${styles}`}
        >
            <div className="flex items-center gap-3">
                <span>{message}</span>
                <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
                    ✕
                </button>
            </div>
        </div>
    );
}

export default Toast;
