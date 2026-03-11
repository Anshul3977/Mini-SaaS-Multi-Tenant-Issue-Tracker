import prisma from "../config/db";
import { IssueStatus, Priority } from "@prisma/client";

// ─── Interfaces ─────────────────────────────────────────

interface CreateIssueInput {
    title: string;
    description?: string;
    priority?: Priority;
    assigneeId?: string;
    reporterId: string;
    tenantId: string;
}

interface UpdateIssueInput {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: Priority;
    assigneeId?: string | null;
}

interface ListIssuesFilter {
    tenantId: string;
    status?: IssueStatus;
    priority?: Priority;
    assigneeId?: string;
    page: number;
    limit: number;
}

// ─── Service ────────────────────────────────────────────

export class IssueService {
    /**
     * Create an issue scoped to the authenticated user's tenant.
     */
    static async create(data: CreateIssueInput) {
        return prisma.issue.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority || Priority.MEDIUM,
                reporterId: data.reporterId,
                assigneeId: data.assigneeId,
                tenantId: data.tenantId, // always from req.user
            },
            include: { reporter: true, assignee: true },
        });
    }

    /**
     * Get a single issue — MUST belong to the given tenant.
     */
    static async findById(id: string, tenantId: string) {
        const issue = await prisma.issue.findFirst({
            where: { id, tenantId },
            include: { reporter: true, assignee: true },
        });
        if (!issue) throw Object.assign(new Error("Issue not found"), { statusCode: 404 });
        return issue;
    }

    /**
     * List issues with filtering + pagination, strictly tenant-scoped.
     */
    static async list(filter: ListIssuesFilter) {
        const skip = (filter.page - 1) * filter.limit;

        const where: Record<string, unknown> = { tenantId: filter.tenantId };
        if (filter.status) where.status = filter.status;
        if (filter.priority) where.priority = filter.priority;
        if (filter.assigneeId) where.assigneeId = filter.assigneeId;

        const [issues, total] = await Promise.all([
            prisma.issue.findMany({
                where,
                include: { reporter: true, assignee: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: filter.limit,
            }),
            prisma.issue.count({ where }),
        ]);

        return {
            issues,
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        };
    }

    /**
     * Update an issue — MUST belong to the given tenant.
     */
    static async update(id: string, tenantId: string, data: UpdateIssueInput) {
        // Verify tenant ownership first
        const existing = await prisma.issue.findFirst({ where: { id, tenantId } });
        if (!existing) throw Object.assign(new Error("Issue not found"), { statusCode: 404 });

        return prisma.issue.update({
            where: { id },
            data,
            include: { reporter: true, assignee: true },
        });
    }

    /**
     * Delete an issue — MUST belong to the given tenant.
     * Role check (OWNER / ADMIN) happens in the route layer.
     */
    static async delete(id: string, tenantId: string) {
        const existing = await prisma.issue.findFirst({ where: { id, tenantId } });
        if (!existing) throw Object.assign(new Error("Issue not found"), { statusCode: 404 });

        return prisma.issue.delete({ where: { id } });
    }
}
