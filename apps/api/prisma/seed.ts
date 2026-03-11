import { PrismaClient, Role, IssueStatus, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding TrackFlow database…\n");

    // ─── Tenant 1: Acme Corp ──────────────────────────────
    const acme = await prisma.tenant.upsert({
        where: { slug: "acme-corp" },
        update: {},
        create: { name: "Acme Corporation", slug: "acme-corp" },
    });

    const aliceHash = await bcrypt.hash("password123", 12);
    const alice = await prisma.user.upsert({
        where: { email: "alice@acme.com" },
        update: {},
        create: {
            name: "Alice Johnson",
            email: "alice@acme.com",
            passwordHash: aliceHash,
            role: Role.OWNER,
            tenantId: acme.id,
        },
    });

    const bobHash = await bcrypt.hash("password123", 12);
    const bob = await prisma.user.upsert({
        where: { email: "bob@acme.com" },
        update: {},
        create: {
            name: "Bob Smith",
            email: "bob@acme.com",
            passwordHash: bobHash,
            role: Role.MEMBER,
            tenantId: acme.id,
        },
    });

    await prisma.issue.createMany({
        skipDuplicates: true,
        data: [
            {
                title: "Login page throws 500 on incorrect password",
                description: "When a user enters wrong credentials, the server returns a 500 instead of 401.",
                status: IssueStatus.OPEN,
                priority: Priority.HIGH,
                reporterId: alice.id,
                assigneeId: bob.id,
                tenantId: acme.id,
            },
            {
                title: "Dashboard charts don't render on Safari",
                description: "Chart.js canvas is blank on Safari 17. Works fine on Chrome and Firefox.",
                status: IssueStatus.IN_PROGRESS,
                priority: Priority.MEDIUM,
                reporterId: bob.id,
                assigneeId: alice.id,
                tenantId: acme.id,
            },
            {
                title: "Add dark mode toggle to settings",
                status: IssueStatus.OPEN,
                priority: Priority.LOW,
                reporterId: alice.id,
                tenantId: acme.id,
            },
            {
                title: "Critical: API rate limiting not enforced",
                description: "No rate limiting on auth endpoints. Brute force attacks possible.",
                status: IssueStatus.OPEN,
                priority: Priority.CRITICAL,
                reporterId: bob.id,
                assigneeId: alice.id,
                tenantId: acme.id,
            },
        ],
    });

    // ─── Tenant 2: Globex Inc ─────────────────────────────
    const globex = await prisma.tenant.upsert({
        where: { slug: "globex-inc" },
        update: {},
        create: { name: "Globex Inc", slug: "globex-inc" },
    });

    const charlieHash = await bcrypt.hash("password123", 12);
    const charlie = await prisma.user.upsert({
        where: { email: "charlie@globex.com" },
        update: {},
        create: {
            name: "Charlie Davis",
            email: "charlie@globex.com",
            passwordHash: charlieHash,
            role: Role.OWNER,
            tenantId: globex.id,
        },
    });

    const danaHash = await bcrypt.hash("password123", 12);
    const dana = await prisma.user.upsert({
        where: { email: "dana@globex.com" },
        update: {},
        create: {
            name: "Dana Lee",
            email: "dana@globex.com",
            passwordHash: danaHash,
            role: Role.ADMIN,
            tenantId: globex.id,
        },
    });

    await prisma.issue.createMany({
        skipDuplicates: true,
        data: [
            {
                title: "Update user role endpoint returns 403 for admins",
                description: "Admin users should be able to change member roles but get a 403.",
                status: IssueStatus.RESOLVED,
                priority: Priority.HIGH,
                reporterId: dana.id,
                assigneeId: charlie.id,
                tenantId: globex.id,
            },
            {
                title: "Implement email verification flow",
                status: IssueStatus.OPEN,
                priority: Priority.MEDIUM,
                reporterId: charlie.id,
                assigneeId: dana.id,
                tenantId: globex.id,
            },
            {
                title: "Fix timezone handling in issue timestamps",
                description: "Timestamps show UTC instead of user's local timezone.",
                status: IssueStatus.IN_PROGRESS,
                priority: Priority.MEDIUM,
                reporterId: dana.id,
                tenantId: globex.id,
            },
        ],
    });

    console.log("✅ Seed complete!");
    console.log(`   Tenant: ${acme.name} (${acme.slug}) — Users: alice@acme.com, bob@acme.com`);
    console.log(`   Tenant: ${globex.name} (${globex.slug}) — Users: charlie@globex.com, dana@globex.com`);
    console.log(`   Password for all users: password123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
