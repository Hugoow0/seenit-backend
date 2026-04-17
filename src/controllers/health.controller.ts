import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";

export const getHealth = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
        res.status(200).json({
            success: true,
            status: true,
            timeStamp: Date.now(),
        });
    },
);
