import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// ─── Request Interceptor: attach JWT from cookie ────────
// In the browser, cookies are sent automatically with withCredentials.
// For SSR / server components we read the cookie from the request context.
// On the client side we also check for a fallback cookie-read approach.
api.interceptors.request.use(async (config) => {
    if (typeof window !== "undefined") {
        // Client-side: read cookie value via the Next.js session endpoint
        // The httpOnly cookie is sent automatically by the browser to our
        // Next.js route handler, which can then proxy it.
        // For client-side API calls directly to the Express backend,
        // we read the token from a non-httpOnly helper or use a cookie parser.
        const match = document.cookie.match(/(?:^|;\s*)trackflow_token=([^;]*)/);
        if (match) {
            config.headers.Authorization = `Bearer ${match[1]}`;
        }
    }
    return config;
});

// ─── Response Interceptor: redirect on 401 ──────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            // Clear the session cookie
            await fetch("/api/auth/session", { method: "DELETE" });
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
