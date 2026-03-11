import prisma from "../config/db";

export class UserService {
    /**
     * List all users belonging to the authenticated user's tenant.
     */
    static async listByTenant(tenantId: string) {
        return prisma.user.findMany({
            where: { tenantId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Get a single user by id, scoped to the tenant.
     */
    static async findById(id: string, tenantId: string) {
        return prisma.user.findFirst({
            where: { id, tenantId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }
}
