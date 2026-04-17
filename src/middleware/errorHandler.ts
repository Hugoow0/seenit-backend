import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Custom error class with an HTTP status code.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Wraps an async route handler to forward thrown errors to Express's
 * error-handling middleware, preventing unhandled promise rejections.
 *
 * Generic over P so controllers can use typed params (e.g. `Request<{ movieId: string }>`).
 */
export function asyncHandler<P = Record<string, string>>(
    fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<void>,
) {
    return (req: Request<P>, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };
}

/**
 * Global error-handling middleware (4-arity).
 * Must be registered AFTER all routes.
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    // ----- Zod validation errors → 400 -----
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: "Validation failed",
            details: err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }

    // ----- Known application errors -----
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // ----- Unknown / unexpected errors -----
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
        console.error("[ERROR]", err.stack ?? err.message);
    }

    res.status(500).json({
        success: false,
        error: isDev ? err.message : "Internal server error",
    });
}
