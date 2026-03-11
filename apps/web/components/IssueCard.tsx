"use client";

interface Issue {
    id: string;
    title: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reporter: { name: string };
    assignee: { name: string } | null;
    createdAt: string;
}

const STATUS_CONFIG: Record<Issue["status"], { label: string; color: string; bg: string }> = {
    OPEN: { label: "Open", color: "text-accent", bg: "bg-accent/10 border-accent/20" },
    IN_PROGRESS: { label: "In Progress", color: "text-warning", bg: "bg-warning/10 border-warning/20" },
    RESOLVED: { label: "Resolved", color: "text-success", bg: "bg-success/10 border-success/20" },
    CLOSED: { label: "Closed", color: "text-text-muted", bg: "bg-text-muted/10 border-text-muted/20" },
};

const PRIORITY_CONFIG: Record<Issue["priority"], { label: string; dot: string }> = {
    CRITICAL: { label: "Critical", dot: "bg-critical" },
    HIGH: { label: "High", dot: "bg-orange-500" },
    MEDIUM: { label: "Medium", dot: "bg-blue-500" },
    LOW: { label: "Low", dot: "bg-gray-500" },
};

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
}

export default function IssueCard({
    issue,
    onClick,
}: {
    issue: Issue;
    onClick?: () => void;
}) {
    const status = STATUS_CONFIG[issue.status];
    const priority = PRIORITY_CONFIG[issue.priority];

    return (
        <div
            onClick={onClick}
            className="group relative bg-surface/60 backdrop-blur border border-border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30"
        >
            {/* ─── Title ───────────────────────────────────── */}
            <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug group-hover:text-accent transition-colors">
                {issue.title}
            </h3>

            {/* ─── Badges Row ──────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                {/* Priority */}
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-hover/60 border border-border rounded-full px-2.5 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                    {priority.label}
                </span>

                {/* Status */}
                <span
                    className={`inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 border ${status.bg} ${status.color}`}
                >
                    {status.label}
                </span>
            </div>

            {/* ─── Meta Row ────────────────────────────────── */}
            <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    {/* Reporter */}
                    <span>{issue.reporter.name}</span>

                    {/* Assignee */}
                    {issue.assignee && (
                        <>
                            <span className="text-text-muted/40">→</span>
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                                    {issue.assignee.name.charAt(0)}
                                </div>
                                <span>{issue.assignee.name}</span>
                            </div>
                        </>
                    )}
                </div>

                <span className="text-text-muted/60">{relativeTime(issue.createdAt)}</span>
            </div>
        </div>
    );
}
