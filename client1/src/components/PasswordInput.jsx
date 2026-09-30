import { useState } from "react";

function PasswordInput({ wrapperClassName = "", className = "", ...props }) {
    const [show, setShow] = useState(false);

    return (
        <div className={`relative ${wrapperClassName}`}>
            <input {...props} type={show ? "text" : "password"} className={`${className} pr-14`} />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/50 hover:text-ink transition-colors"
            >
                {show ? "Hide" : "Show"}
            </button>
        </div>
    );
}

export default PasswordInput;
