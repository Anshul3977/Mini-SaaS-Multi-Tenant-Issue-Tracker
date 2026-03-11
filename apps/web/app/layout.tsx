import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TrackFlow — Multi-Tenant Issue Tracker",
    description:
        "Track, manage, and resolve issues across your organisation with TrackFlow. Built for teams that move fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
