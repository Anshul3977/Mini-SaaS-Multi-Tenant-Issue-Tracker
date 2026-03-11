"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import FilterBar from "@/components/FilterBar";
import IssueCard from "@/components/IssueCard";
import IssueModal from "@/components/IssueModal";

interface Issue {
    id: string;
    title: string;
    description?: string | null;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reporter: { name: string };
    assignee: { name: string } | null;
    assigneeId?: string | null;
    createdAt: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editIssue, setEditIssue] = useState<Issue | null>(null);

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", "12");
            if (status) params.set("status", status);
            if (priority) params.set("priority", priority);

            const { data } = await api.get(`/issues?${params.toString()}`);
            setIssues(data.data || []);
            if (data.meta) setMeta(data.meta);
        } catch {
            // API not available
        } finally {
            setLoading(false);
        }
    }, [page, status, priority]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [status, priority]);

    const openCreate = () => {
        setEditIssue(null);
        setModalOpen(true);
    };

    const openEdit = (issue: Issue) => {
        setEditIssue(issue);
        setModalOpen(true);
    };

    // Client-side search filter
    const filtered = search
        ? issues.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
        : issues;

    return (
        <>
            {/* ─── Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Issues</h1>
                    <p className="text-text-muted text-sm mt-0.5">
                        {meta.total} issue{meta.total !== 1 ? "s" : ""} total
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 transition flex items-center gap-2"
                >
                    <span className="text-lg leading-none">+</span>
                    New Issue
                </button>
            </div>

            {/* ─── Filters ─────────────────────────────────── */}
            <FilterBar
                status={status}
                onStatusChange={setStatus}
                priority={priority}
                onPriorityChange={setPriority}
                search={search}
                onSearchChange={setSearch}
            />

            {/* ─── Issues Grid ─────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-text-muted">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading issues…
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-text-muted text-lg mb-2">No issues found</p>
                    <p className="text-text-muted/60 text-sm">
                        {search || status || priority
                            ? "Try adjusting your filters"
                            : "Create your first issue to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                    {filtered.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} onClick={() => openEdit(issue)} />
                    ))}
                </div>
            )}

            {/* ─── Pagination ──────────────────────────────── */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-muted hover:text-text-primary hover:border-text-muted/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Prev
                    </button>

                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${p === page
                                    ? "bg-accent text-white"
                                    : "text-text-muted hover:text-text-primary hover:bg-surface-hover border border-border"
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        disabled={page >= meta.totalPages}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-muted hover:text-text-primary hover:border-text-muted/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* ─── Modal ───────────────────────────────────── */}
            <IssueModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={fetchIssues}
                editIssue={editIssue}
            />
        </>
    );
}
