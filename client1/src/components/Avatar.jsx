function Avatar({ name = "?", size = "sm" }) {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
    const sizes = { sm: "h-5 w-5 text-[10px]", md: "h-7 w-7 text-xs" };

    return (
        <span
            title={name}
            className={`${sizes[size]} inline-flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold`}
        >
            {initials}
        </span>
    );
}

export default Avatar;
