import useTheme from "../hooks/useTheme";

function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="text-ink/50 hover:text-ink px-2 py-1 rounded-md border border-line hover:border-ink/30 transition-colors text-sm"
        >
            {theme === "dark" ? "☀" : "☾"}
        </button>
    );
}

export default ThemeToggle;
