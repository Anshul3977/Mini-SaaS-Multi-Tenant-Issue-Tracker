import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#0a0a0f",
                surface: "#14141f",
                "surface-hover": "#1e1e2e",
                border: "#2a2a3d",
                "text-primary": "#e4e4ef",
                "text-muted": "#8888a0",
                accent: "#6c5ce7",
                "accent-hover": "#7c6df7",
                success: "#00cec9",
                warning: "#fdcb6e",
                danger: "#ff6b6b",
                critical: "#e74c3c",
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
            },
            borderRadius: {
                card: "12px",
            },
            keyframes: {
                "fade-scale": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "fade-scale": "fade-scale 200ms ease-out",
            },
        },
    },
    plugins: [],
};

export default config;
