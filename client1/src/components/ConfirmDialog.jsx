import useEscape from "../hooks/useEscape";
import InlineSpinner from "./InlineSpinner";

function ConfirmDialog({ title, message, confirmLabel = "Confirm", loading = false, onConfirm, onCancel }) {
    useEscape(onCancel);

    return (
        <div
            className="fixed inset-0 bg-ink/40 flex items-center justify-center z-[60] p-4"
            onClick={onCancel}
        >
            <div
                className="bg-surface rounded-lg p-6 w-full max-w-sm font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="font-display font-semibold text-lg text-ink mb-2">{title}</h2>
                <p className="text-sm text-ink/60 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="text-sm text-ink/60 hover:text-ink px-3 py-2 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-danger text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <InlineSpinner />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
