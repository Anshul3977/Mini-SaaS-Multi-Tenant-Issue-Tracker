export default function HomePage() {
    return (
        <main
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                gap: "1.5rem",
                textAlign: "center",
                padding: "2rem",
            }}
        >
            <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>
                Track<span style={{ color: "var(--color-primary)" }}>Flow</span>
            </h1>
            <p style={{ color: "var(--color-text-muted)", maxWidth: "480px", fontSize: "1.1rem" }}>
                Multi-tenant issue tracking for teams that ship fast.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
                <a
                    href="/login"
                    style={{
                        padding: "0.75rem 2rem",
                        borderRadius: "var(--radius)",
                        background: "var(--color-primary)",
                        color: "#fff",
                        fontWeight: 600,
                    }}
                >
                    Log In
                </a>
                <a
                    href="/register"
                    style={{
                        padding: "0.75rem 2rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        fontWeight: 600,
                    }}
                >
                    Register
                </a>
            </div>
        </main>
    );
}
