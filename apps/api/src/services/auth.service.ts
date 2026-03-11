import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { config } from "../config";
import { Role } from "@prisma/client";

// ─── Helpers ────────────────────────────────────────────

function toKebabCase(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function signToken(userId: string, tenantId: string, role: Role): string {
    return jwt.sign({ userId, tenantId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
    });
}

// ─── Interfaces ─────────────────────────────────────────

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    tenantName: string;
}

interface JoinInput {
    name: string;
    email: string;
    password: string;
    tenantSlug: string;
}

interface LoginInput {
    email: string;
    password: string;
}

// ─── Service ────────────────────────────────────────────

export class AuthService {
    /**
     * Register a brand-new organisation.
     * Creates Tenant + OWNER User atomically inside a Prisma transaction.
     */
    static async register({ name, email, password, tenantName }: RegisterInput) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
        }

        const slug = toKebabCase(tenantName);

        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) {
            throw Object.assign(new Error("Organisation slug already taken"), { statusCode: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const { tenant, user } = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: { name: tenantName, slug },
            });

            const user = await tx.user.create({
                data: { name, email, passwordHash, role: Role.OWNER, tenantId: tenant.id },
            });

            return { tenant, user };
        });

        const token = signToken(user.id, tenant.id, user.role);

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
            token,
        };
    }

    /**
     * Join an existing organisation as MEMBER.
     */
    static async join({ name, email, password, tenantSlug }: JoinInput) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
        }

        const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
        if (!tenant) {
            throw Object.assign(new Error("Organisation not found"), { statusCode: 404 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: Role.MEMBER, tenantId: tenant.id },
        });

        const token = signToken(user.id, tenant.id, user.role);

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
            token,
        };
    }

    /**
     * Authenticate by email + password.
     */
    static async login({ email, password }: LoginInput) {
        const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
        if (!user) {
            throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
        }

        const token = signToken(user.id, user.tenantId, user.role);

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
            token,
        };
    }
}
