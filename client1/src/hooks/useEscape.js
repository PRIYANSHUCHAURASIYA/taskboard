import { useEffect } from "react";

export default function useEscape(handler) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") handler();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handler]);
}
