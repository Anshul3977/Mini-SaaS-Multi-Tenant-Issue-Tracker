import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { IssueService } from "../services";
import { IssueStatus, Priority } from "@prisma/client";

export class IssueController {
    static async create(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
            return;
        }

        const { title, description, priority, assigneeId } = req.body;

        const issue = await IssueService.create({
            title,
            description,
            priority,
            assigneeId,
            reporterId: req.user!.userId,
            tenantId: req.user!.tenantId, // from JWT — never from client
        });

        res.status(201).json({
            success: true,
            message: "Issue created",
            data: issue,
        });
    }

    static async list(req: Request, res: Response) {
        const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

        const result = await IssueService.list({
            tenantId: req.user!.tenantId,
            status: req.query.status as IssueStatus | undefined,
            priority: req.query.priority as Priority | undefined,
            assigneeId: req.query.assigneeId as string | undefined,
            page,
            limit,
        });

        res.json({
            success: true,
            message: "Issues retrieved",
            data: result.issues,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    }

    static async getById(req: Request, res: Response) {
        const issue = await IssueService.findById(req.params.id as string, req.user!.tenantId);

        res.json({
            success: true,
            message: "Issue retrieved",
            data: issue,
        });
    }

    static async update(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
            return;
        }

        const { title, description, status, priority, assigneeId } = req.body;

        const issue = await IssueService.update(req.params.id as string, req.user!.tenantId, {
            title,
            description,
            status,
            priority,
            assigneeId,
        });

        res.json({
            success: true,
            message: "Issue updated",
            data: issue,
        });
    }

    static async delete(req: Request, res: Response) {
        await IssueService.delete(req.params.id as string, req.user!.tenantId);

        res.json({
            success: true,
            message: "Issue deleted",
            data: null,
        });
    }
}
