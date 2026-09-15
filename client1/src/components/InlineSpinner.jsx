function InlineSpinner({ className = "" }) {
    return (
        <span
            className={`inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
}

export default InlineSpinner;
