"use client";

import { useState, useEffect, FormEvent } from "react";
import api from "@/lib/api";

interface IssueModalProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    editIssue?: {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        priority: string;
        assigneeId?: string | null;
    } | null;
}

interface Member {
    id: string;
    name: string;
    email: string;
}

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function IssueModal({ open, onClose, onSaved, editIssue }: IssueModalProps) {
    const isEdit = !!editIssue;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("OPEN");
    const [priority, setPriority] = useState("MEDIUM");
    const [assigneeId, setAssigneeId] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Populate fields when editing
    useEffect(() => {
        if (editIssue) {
            setTitle(editIssue.title);
            setDescription(editIssue.description || "");
            setStatus(editIssue.status);
            setPriority(editIssue.priority);
            setAssigneeId(editIssue.assigneeId || "");
        } else {
            setTitle("");
            setDescription("");
            setStatus("OPEN");
            setPriority("MEDIUM");
            setAssigneeId("");
        }
        setError("");
    }, [editIssue, open]);

    // Fetch tenant members for assignee dropdown
    useEffect(() => {
        if (!open) return;
        api
            .get("/users")
            .then((res) => setMembers(res.data.data || res.data))
            .catch(() => { });
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const body: Record<string, unknown> = {
                title,
                description: description || undefined,
                priority,
                assigneeId: assigneeId || undefined,
            };

            if (isEdit) {
                body.status = status;
                await api.put(`/issues/${editIssue!.id}`, body);
            } else {
                await api.post("/issues", body);
            }

            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const selectClasses =
        "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition appearance-none";

    return (
        <>
            {/* ─── Overlay ─────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* ─── Panel (slide-in from right) ─────────────── */}
            <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-surface border-l border-border shadow-2xl shadow-black/40 overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text-primary">
                        {isEdit ? "Edit Issue" : "New Issue"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {error && (
                        <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm text-text-muted font-medium">Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            minLength={3}
                            maxLength={100}
                            placeholder="Bug on login page…"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                        />
                    </label>

                    {/* Description */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm text-text-muted font-medium">Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe the issue in detail…"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition resize-none"
                        />
                    </label>

                    {/* Priority + Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm text-text-muted font-medium">Priority</span>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className={selectClasses}
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>
                                        {p.charAt(0) + p.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {isEdit && (
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm text-text-muted font-medium">Status</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={selectClasses}
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s.replace("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>

                    {/* Assignee */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm text-text-muted font-medium">Assignee</span>
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.email})
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? isEdit
                                ? "Saving…"
                                : "Creating…"
                            : isEdit
                                ? "Save Changes"
                                : "Create Issue"}
                    </button>
                </form>
            </div>

            <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
}
