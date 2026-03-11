import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Global error-handling middleware.
 * Uses standardized { success, message, data } shape.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("[ErrorHandler]", err);

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            data: err.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }

    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        data: null,
    });
};
