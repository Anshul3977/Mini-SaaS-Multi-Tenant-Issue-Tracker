"use client";

interface FilterBarProps {
    status: string;
    onStatusChange: (v: string) => void;
    priority: string;
    onPriorityChange: (v: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
}

const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" },
];

const PRIORITY_OPTIONS = [
    { value: "", label: "All" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
];

export default function FilterBar({
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    search,
    onSearchChange,
}: FilterBarProps) {
    const pillBase =
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer select-none";
    const pillActive = "bg-accent/15 border-accent/30 text-accent";
    const pillInactive =
        "bg-surface-hover/40 border-border text-text-muted hover:text-text-primary hover:border-text-muted/30";

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-y border-border">
            {/* ─── Status Pills ────────────────────────────── */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-text-muted/60 mr-1 font-medium uppercase tracking-wider">Status</span>
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusChange(opt.value)}
                        className={`${pillBase} ${status === opt.value ? pillActive : pillInactive}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* ─── Priority Pills ──────────────────────────── */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-text-muted/60 mr-1 font-medium uppercase tracking-wider">Priority</span>
                {PRIORITY_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onPriorityChange(opt.value)}
                        className={`${pillBase} ${priority === opt.value ? pillActive : pillInactive}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* ─── Search ──────────────────────────────────── */}
            <div className="sm:ml-auto w-full sm:w-auto">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search issues…"
                    className="w-full sm:w-56 px-4 py-2 rounded-full border border-border bg-surface/60 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition"
                />
            </div>
        </div>
    );
}
