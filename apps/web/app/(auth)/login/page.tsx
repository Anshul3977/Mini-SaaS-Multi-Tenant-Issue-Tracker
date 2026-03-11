"use client";

import { useState, FormEvent } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login", { email, password });

            // Store JWT in httpOnly cookie via Next.js route handler
            await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: data.data.token }),
            });

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ─── Header ──────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
                <p className="text-text-muted text-sm">Sign in to your TrackFlow account</p>
            </div>

            {/* ─── Error ───────────────────────────────────── */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                    {error}
                </div>
            )}

            {/* ─── Form ────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted font-medium">Email</span>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className="px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted font-medium">Password</span>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                    />
                </label>

                <button
                    id="login-submit"
                    type="submit"
                    disabled={loading}
                    className="mt-2 py-3 rounded-lg bg-accent text-white font-semibold text-base hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in…
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* ─── Footer ──────────────────────────────────── */}
            <p className="mt-6 text-center text-sm text-text-muted">
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
                    Register
                </a>
            </p>
        </>
    );
}
