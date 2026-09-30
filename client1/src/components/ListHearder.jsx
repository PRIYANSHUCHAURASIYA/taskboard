import { useState, useRef, useEffect } from "react";

function ListHeader({ list, count, dragHandleProps, onRename, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [menuOpen, setMenuOpen] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setTitle(list.title);
    }, [list.title]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const save = () => {
        const next = title.trim();
        setEditing(false);
        if (next && next !== list.title) onRename(next);
        else setTitle(list.title);
    };

    return (
        <div {...dragHandleProps} className="flex items-center justify-between gap-2 mb-3 px-1 cursor-grab">
            {editing ? (
                <input
                    ref={inputRef}
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={save}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") save();
                        if (e.key === "Escape") {
                            setTitle(list.title);
                            setEditing(false);
                        }
                    }}
                    className="flex-1 min-w-0 border border-accent rounded px-1.5 py-0.5 text-sm font-display font-medium text-ink focus:outline-none"
                />
            ) : (
                <h2
                    onDoubleClick={() => setEditing(true)}
                    title="Double-click to rename"
                    className="flex-1 min-w-0 truncate font-display font-medium text-sm text-ink"
                >
                    {list.title}
                    <span className="ml-1.5 text-ink/40 font-normal">{count}</span>
                </h2>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="List options"
                    className="text-ink/40 hover:text-ink px-1.5 rounded transition-colors"
                >
                    ⋯
                </button>
                {menuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 mt-1 w-36 bg-surface border border-line rounded-md shadow-lg p-1 z-20">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    setEditing(true);
                                }}
                                className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-paper text-ink transition-colors"
                            >
                                Rename
                            </button>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete();
                                }}
                                className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-danger/10 text-danger transition-colors"
                            >
                                Delete list
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ListHeader;
