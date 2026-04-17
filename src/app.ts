import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes";

const app = express();

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(
        `[${timestamp}] ${res.statusCode} ${req.method} ${req.originalUrl}`,
    );
    next();
});

// ----- Security Headers -----
app.use(helmet());

// ----- CORS -----
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    }),
);

// ----- Cookie Parsing -----
app.use(cookieParser());

// ----- Global Rate Limiting -----
app.use(globalLimiter);

// ----- Trust proxy (for accurate IP behind reverse proxies) -----
app.set("trust proxy", 1);

// Routes
app.use("/api", apiRoutes);

// ----- 404 Catch-All -----
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

// ----- Global Error Handler (must be last) -----
app.use(errorHandler);

export default app;
