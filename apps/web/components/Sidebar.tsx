"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Issues", href: "/dashboard/issues", icon: "🐛" },
    { label: "Members", href: "#", icon: "👥", disabled: true },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/auth/session", { method: "DELETE" });
        router.push("/login");
    };

    return (
        <>
            {/* ─── Mobile toggle ───────────────────────────── */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-surface/80 backdrop-blur border border-border text-text-primary"
                aria-label="Toggle sidebar"
            >
                {collapsed ? "✕" : "☰"}
            </button>

            {/* ─── Sidebar ─────────────────────────────────── */}
            <aside
                className={`
          fixed md:sticky top-0 left-0 z-40 h-screen
          flex flex-col
          bg-surface/80 backdrop-blur-xl border-r border-border
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-64 translate-x-0" : "-translate-x-full w-64"}
          md:translate-x-0 md:w-64
        `}
            >
                {/* ─── Logo ──────────────────────────────────── */}
                <div className="px-5 pt-6 pb-8">
                    <h2 className="text-xl font-extrabold">
                        <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                            Track
                        </span>
                        <span className="text-text-primary">Flow</span>
                    </h2>
                </div>

                {/* ─── Navigation ────────────────────────────── */}
                <nav className="flex-1 flex flex-col gap-1 px-3">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.label}
                                href={item.disabled ? undefined : item.href}
                                onClick={(e) => {
                                    if (item.disabled) e.preventDefault();
                                    if (!item.disabled) setCollapsed(false);
                                }}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${item.disabled
                                        ? "text-text-muted/40 cursor-not-allowed"
                                        : isActive
                                            ? "bg-accent/10 text-accent font-semibold border border-accent/20"
                                            : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                                    }
                `}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                                {item.disabled && (
                                    <span className="ml-auto text-[10px] uppercase tracking-wider text-text-muted/30 font-semibold">
                                        Soon
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* ─── User / Logout ─────────────────────────── */}
                <div className="px-3 pb-4 mt-auto border-t border-border pt-4">
                    <div className="flex items-center gap-3 px-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                            TF
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">User</p>
                            <p className="text-xs text-text-muted truncate">TrackFlow Org</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/5 border border-transparent hover:border-danger/20 transition-all"
                    >
                        <span>↩</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ─── Mobile overlay ──────────────────────────── */}
            {collapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={() => setCollapsed(false)}
                />
            )}
        </>
    );
}
