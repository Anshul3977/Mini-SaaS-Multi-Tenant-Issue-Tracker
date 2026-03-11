"use client";

import { useState, FormEvent } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type Tab = "create" | "join";

export default function RegisterPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("create");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [tenantSlug, setTenantSlug] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let data;

            if (tab === "create") {
                const res = await api.post("/auth/register", { name, email, password, tenantName });
                data = res.data;
            } else {
                const res = await api.post("/auth/register/join", { name, email, password, tenantSlug });
                data = res.data;
            }

            // Store JWT in httpOnly cookie
            await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: data.data.token }),
            });

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses =
        "w-full px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition";

    return (
        <>
            {/* ─── Header ──────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Get started</h1>
                <p className="text-text-muted text-sm">Create or join an organisation on TrackFlow</p>
            </div>

            {/* ─── Tab Toggle ──────────────────────────────── */}
            <div className="flex mb-6 rounded-lg overflow-hidden border border-border bg-bg">
                <button
                    type="button"
                    onClick={() => setTab("create")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${tab === "create"
                            ? "bg-accent text-white"
                            : "bg-transparent text-text-muted hover:text-text-primary"
                        }`}
                >
                    Create Organisation
                </button>
                <button
                    type="button"
                    onClick={() => setTab("join")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${tab === "join"
                            ? "bg-accent text-white"
                            : "bg-transparent text-text-muted hover:text-text-primary"
                        }`}
                >
                    Join Organisation
                </button>
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
                    <span className="text-sm text-text-muted font-medium">Full Name</span>
                    <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Jane Doe"
                        className={inputClasses}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted font-medium">Email</span>
                    <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className={inputClasses}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted font-medium">Password</span>
                    <input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        className={inputClasses}
                    />
                </label>

                {tab === "create" ? (
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-text-muted font-medium">Company Name</span>
                        <input
                            id="register-tenant-name"
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                            placeholder="Acme Corporation"
                            className={inputClasses}
                        />
                        <span className="text-xs text-text-muted/60 mt-0.5">
                            Slug will be auto-generated from this name
                        </span>
                    </label>
                ) : (
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-text-muted font-medium">Organisation Slug</span>
                        <input
                            id="register-tenant-slug"
                            type="text"
                            value={tenantSlug}
                            onChange={(e) =>
                                setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            }
                            required
                            placeholder="acme-corp"
                            className={inputClasses}
                        />
                        <span className="text-xs text-text-muted/60 mt-0.5">
                            Ask your team admin for the organisation slug
                        </span>
                    </label>
                )}

                <button
                    id="register-submit"
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
                            {tab === "create" ? "Creating organisation…" : "Joining organisation…"}
                        </span>
                    ) : tab === "create" ? (
                        "Create Organisation"
                    ) : (
                        "Join Organisation"
                    )}
                </button>
            </form>

            {/* ─── Footer ──────────────────────────────────── */}
            <p className="mt-6 text-center text-sm text-text-muted">
                Already have an account?{" "}
                <a href="/login" className="text-accent font-semibold hover:text-accent-hover transition-colors">
                    Sign In
                </a>
            </p>
        </>
    );
}
