import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError, asyncHandler, errorHandler } from "../../src/middleware/errorHandler";

function createMockResponse(): Response {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res) as unknown as Response["status"];
    res.json = vi.fn().mockReturnValue(res) as unknown as Response["json"];
    return res;
}

describe("errorHandler middleware", () => {
    it("expose statusCode and message for AppError", () => {
        const error = new AppError(404, "Resource not found");

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AppError");
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Resource not found");
    });

    it("forwards rejected errors with asyncHandler", async () => {
        const wrapped = asyncHandler(async () => {
            throw new Error("boom");
        });

        const next = vi.fn() as NextFunction;
        wrapped({} as Request, {} as Response, next);

        await vi.waitFor(() => {
            expect(next).toHaveBeenCalledTimes(1);
        });
        expect((next as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBeInstanceOf(Error);
    });

    it("maps AppError to proper HTTP status and payload", () => {
        const res = createMockResponse();

        errorHandler(new AppError(401, "Unauthorized"), {} as Request, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Unauthorized",
        });
    });

    it("maps ZodError to 400 with details", () => {
        const res = createMockResponse();

        const schema = z.object({
            page: z.number().int().positive(),
        });

        let zodError: Error | null = null;
        try {
            schema.parse({ page: "abc" });
        } catch (error) {
            zodError = error as Error;
        }

        expect(zodError).not.toBeNull();
        errorHandler(zodError as Error, {} as Request, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: "Validation failed",
                details: expect.any(Array),
            }),
        );
    });

    it("hides internal message in production for unknown errors", () => {
        const previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        const res = createMockResponse();
        errorHandler(new Error("sensitive information"), {} as Request, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Internal server error",
        });

        process.env.NODE_ENV = previousNodeEnv;
    });
});
