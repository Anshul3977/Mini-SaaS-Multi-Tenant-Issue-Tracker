export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-bg via-[#10101a] to-[#1a1a2e] p-6">
            <div className="w-full max-w-[440px] bg-surface/80 backdrop-blur-xl border border-border rounded-card p-8 shadow-2xl shadow-accent/5">
                {children}
            </div>
        </div>
    );
}
