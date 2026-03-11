"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Issue {
    id: string;
    title: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reporter: { name: string };
    assignee: { name: string } | null;
    createdAt: string;
}

interface Stats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
}

const STATUS_DOT: Record<string, string> = {
    OPEN: "bg-accent",
    IN_PROGRESS: "bg-warning",
    RESOLVED: "bg-success",
    CLOSED: "bg-text-muted",
};

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, resolved: 0 });
    const [recent, setRecent] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/issues?limit=5");
                const issues: Issue[] = data.data || [];
                const total = data.meta?.total ?? issues.length;

                setStats({
                    total,
                    open: issues.filter((i) => i.status === "OPEN").length,
                    inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
                    resolved: issues.filter((i) => i.status === "RESOLVED").length,
                });
                setRecent(issues);
            } catch {
                // API not connected yet — show zeroes
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const statCards = [
        { label: "Total Issues", value: stats.total, accent: "border-accent/30 text-accent" },
        { label: "Open", value: stats.open, accent: "border-accent/30 text-accent" },
        { label: "In Progress", value: stats.inProgress, accent: "border-warning/30 text-warning" },
        { label: "Resolved", value: stats.resolved, accent: "border-success/30 text-success" },
    ];

    return (
        <>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
            <p className="text-text-muted text-sm mb-8">Overview of your workspace</p>

            {/* ─── Stats Row ───────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`bg-surface/60 backdrop-blur border ${card.accent.split(" ")[0]} rounded-xl p-5 transition hover:shadow-lg hover:shadow-accent/5`}
                    >
                        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">
                            {card.label}
                        </p>
                        <p className={`text-3xl font-extrabold ${card.accent.split(" ")[1]}`}>
                            {loading ? "—" : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* ─── Recent Issues ───────────────────────────── */}
            <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Issues</h2>

            {loading ? (
                <div className="text-text-muted text-sm">Loading…</div>
            ) : recent.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                    <p className="text-lg mb-2">No issues yet</p>
                    <p className="text-sm">
                        Create your first issue from the{" "}
                        <a href="/dashboard/issues" className="text-accent font-medium">
                            Issues page
                        </a>
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-surface/40">
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Priority</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Reporter</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((issue) => (
                                <tr
                                    key={issue.id}
                                    className="border-b border-border last:border-0 hover:bg-surface-hover/40 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-text-primary max-w-xs truncate">
                                        {issue.title}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[issue.status]}`} />
                                            <span className="text-text-muted">
                                                {issue.status.replace("_", " ")}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">{issue.priority}</td>
                                    <td className="px-4 py-3 text-text-muted">{issue.reporter.name}</td>
                                    <td className="px-4 py-3 text-text-muted">
                                        {issue.assignee?.name || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
