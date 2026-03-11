import { Request, Response, NextFunction } from "express";

/**
 * Injects tenantId from the authenticated user into the request
 * so downstream handlers can safely scope all queries.
 */
export const tenantScope = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.tenantId) {
        res.status(400).json({ error: "Tenant context is missing" });
        return;
    }

    // Attach tenantId to body/query for convenience
    req.body.tenantId = req.user.tenantId;
    next();
};
