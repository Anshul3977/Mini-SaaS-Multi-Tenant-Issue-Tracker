import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware";

const app = express();

// ─── Global Middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// ─── Health Check ───────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────
app.use("/api", routes);

// ─── Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(config.port, () => {
    console.log(`🚀 TrackFlow API running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
});

export default app;
