import { useState, useRef, useEffect } from "react";
import InlineSpinner from "./InlineSpinner";

function Composer({ triggerLabel, placeholder, submitLabel, onAdd }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [busy, setBusy] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const close = () => {
        setOpen(false);
        setTitle("");
    };

    const submit = async (e) => {
        e.preventDefault();
        const value = title.trim();
        if (!value || busy) return;
        setBusy(true);
        const ok = await onAdd(value);
        setBusy(false);
        if (ok) {
            setTitle("");
            inputRef.current?.focus();
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full text-left text-sm text-ink/50 hover:text-ink hover:bg-paper rounded-md px-2 py-1.5 transition-colors"
            >
                + {triggerLabel}
            </button>
        );
    }

    return (
        <form onSubmit={submit}>
            <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") close();
                }}
                placeholder={placeholder}
                className="w-full border border-line bg-surface rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <div className="flex items-center gap-2 mt-2">
                <button
                    type="submit"
                    disabled={busy}
                    className="bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {busy && <InlineSpinner />}
                    {submitLabel}
                </button>
                <button
                    type="button"
                    onClick={close}
                    className="text-sm text-ink/50 hover:text-ink transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default Composer;
