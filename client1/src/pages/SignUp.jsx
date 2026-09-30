import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import InlineSpinner from "../components/InlineSpinner";

function SignUp() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await API.post("/auth/signup", form);
            localStorage.setItem("token", res.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper font-sans">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center gap-2">
                    <div className="h-8 w-8 bg-accent rounded-sm flex items-center justify-center">
                        <div className="h-3 w-3 bg-paper rounded-[2px]" />
                    </div>
                    <span className="font-display font-semibold text-xl text-ink">
                        Taskboard
                    </span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-surface border border-line rounded-lg p-8"
                >
                    <h1 className="font-display font-semibold text-2xl text-ink mb-1">
                        Create your account
                    </h1>
                    <p className="text-sm text-ink/60 mb-6">
                        Start organizing your team's work.
                    </p>

                    {error && (
                        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-md px-3 py-2 mb-4">
                            {error}
                        </div>
                    )}

                    <label className="block text-sm font-medium text-ink mb-1.5">
                        Full name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-line rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />

                    <label className="block text-sm font-medium text-ink mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-line rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />

                    <label className="block text-sm font-medium text-ink mb-1.5">
                        Password
                    </label>
                    <PasswordInput
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        wrapperClassName="mb-6"
                        className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <InlineSpinner />}
                        {loading ? "Creating account" : "Create account"}
                    </button>

                    <p className="text-sm text-center text-ink/60 mt-5">
                        Already have an account?{" "}
                        <Link to="/login" className="text-accent font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
