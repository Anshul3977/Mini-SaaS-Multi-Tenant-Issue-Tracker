# TrackFlow — Multi-Tenant Issue Tracker SaaS

A production-ready, multi-tenant issue tracking platform built with a modern full-stack monorepo architecture. Each organisation operates in complete data isolation, backed by JWT-based authentication and role-based access control.

---

## Table of Contents

- [Overview](#overview)
- [Architecture Decisions](#architecture-decisions)
  - [Database Design](#database-design)
  - [Security Model](#security-model)
  - [API Design](#api-design)
  - [Frontend Architecture](#frontend-architecture)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

## Overview

TrackFlow lets organisations create isolated workspaces (tenants), invite team members, and track issues through a Kanban-like lifecycle: **Open → In Progress → Resolved → Closed**.

### Monorepo Structure

```
trackflow/
├── package.json          ← npm workspaces root
├── apps/
│   ├── api/              ← Express + Prisma REST API
│   │   ├── prisma/       ← schema + migrations + seed
│   │   └── src/          ← config, controllers, middleware, routes, services, utils
│   └── web/              ← Next.js 14 App Router frontend
│       ├── app/          ← pages (auth, dashboard, issues)
│       ├── components/   ← Sidebar, IssueCard, IssueModal, FilterBar
│       └── lib/          ← axios instance with JWT interceptor
```

---

## Architecture Decisions

### Database Design

**Why PostgreSQL over MongoDB:**

| Factor | PostgreSQL | MongoDB |
|--------|-----------|---------|
| Relational integrity | FK constraints enforce Tenant → User → Issue | Manual reference integrity |
| Tenant isolation | `WHERE tenantId = ?` on indexed columns | Requires discipline in every query |
| Transactional safety | ACID transactions (e.g. register) | Limited multi-doc transactions |
| Type safety with Prisma | First-class support | Supported but less mature |

**Entity Relationships:**

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Tenant  │──1:N──│   User   │──1:N──│  Issue   │
│          │       │          │◄──────│ reporter │
│  id      │       │  id      │       │ assignee │
│  name    │       │  name    │       │          │
│  slug ◄──┼───────┤ tenantId │  ┌────┤ tenantId │
│          │       │  role    │  │    │  status  │
└──────────┘       └──────────┘  │    │ priority │
                                 │    └──────────┘
                                 │
                        @@index([tenantId])
```

- **`tenantId` is indexed** on both `User` and `Issue` tables, ensuring all tenant-scoped queries hit an index rather than scanning the full table.
- **Prisma** was chosen for type-safe query building, automatic migration management, and generated TypeScript types that flow from schema → service → controller.

### Security Model

**JWT Payload:**
```json
{ "userId": "cuid", "tenantId": "cuid", "role": "OWNER" }
```

**Critical principle: `tenantId` is NEVER trusted from the request body.** It is always extracted from the verified JWT token in the `authenticate` middleware and injected into every Prisma query by the service layer.

**Role-Based Access Control:**

| Role | Create Issue | Update Issue | Delete Issue | Manage Members |
|------|:-----------:|:------------:|:------------:|:--------------:|
| OWNER | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ❌ |
| MEMBER | ✅ | ✅ | ❌ | ❌ |

**Why httpOnly cookies over localStorage:**
- **XSS protection**: httpOnly cookies cannot be read by JavaScript, preventing token theft via XSS.
- **Automatic transmission**: Cookies are sent with every request without manual attachment.
- **Secure + SameSite**: Production cookies use `Secure` + `SameSite=Lax` to prevent CSRF.

### API Design

**RESTful Resource Structure:**
```
POST   /api/auth/register       ← Create org + OWNER
POST   /api/auth/register/join  ← Join existing org as MEMBER
POST   /api/auth/login          ← Authenticate
GET    /api/auth/me             ← Current user

POST   /api/issues              ← Create (any role)
GET    /api/issues              ← List with filters + pagination
GET    /api/issues/:id          ← Get one
PUT    /api/issues/:id          ← Update (any role)
DELETE /api/issues/:id          ← Delete (OWNER/ADMIN only)

GET    /api/users               ← List tenant members
GET    /api/users/:id           ← Get member
```

**Standardized Response Envelope:**
```json
{
  "success": true,
  "message": "Issues retrieved",
  "data": [...],
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Pagination**: Offset-based via `?page=1&limit=20`. Responses include `meta.total` and `meta.totalPages` for frontend pagination controls.

### Frontend Architecture

- **Next.js 14 App Router** for file-based routing, server components, and built-in API routes (used for cookie session management).
- **Axios interceptor pattern**: A single `api.ts` instance handles JWT injection (from cookie) and auto-redirect on 401.
- **Component hierarchy**:
  ```
  RootLayout
  ├── (auth)/layout.tsx  → glass card center
  │   ├── login/page
  │   └── register/page  → tab toggle Create / Join
  └── dashboard/layout.tsx → Sidebar + main
      ├── page.tsx        → Stats + Recent issues
      └── issues/page.tsx → FilterBar + IssueCard grid + Modal
  ```

---

## Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (workspaces support)
- **PostgreSQL** ≥ 14 (or Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16`)

### Steps

```bash
# 1  Clone
git clone <your-repo-url> trackflow
cd trackflow

# 2  Install dependencies
npm install

# 3  Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit apps/api/.env → set DATABASE_URL to your PostgreSQL instance

# 4  Run Prisma migrations + generate client
npm run prisma:migrate --workspace=apps/api

# 5  (Optional) Seed test data
npx prisma db seed --workspace=apps/api

# 6  Start both apps
npm run dev
# → API: http://localhost:4000
# → Web: http://localhost:3000
```

### Environment Variables

**apps/api/.env:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trackflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-me"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

**apps/web/.env:**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## Deployment

### Backend → Render (Free Tier)

1. **Create PostgreSQL** on Render → copy the **Internal Database URL**.

2. **Create Web Service** → connect your GitHub repo.

3. **Configure:**
   | Setting | Value |
   |---------|-------|
   | Root Directory | `apps/api` |
   | Build Command | `npm install && npx prisma migrate deploy && npx prisma generate && npm run build` |
   | Start Command | `node dist/index.js` |

4. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Render PostgreSQL Internal URL |
   | `JWT_SECRET` | Generate: `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `PORT` | `4000` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` |

### Frontend → Vercel

1. **Import** monorepo → set **Root Directory** to `apps/web`.

2. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com/api` |

3. **Deploy**. Vercel auto-detects Next.js.

### Post-Deploy: Seed Database

After the API is live with migrations applied:

```bash
# From your local machine, set DATABASE_URL to the Render external URL
DATABASE_URL="postgresql://user:pass@host:5432/trackflow" npx prisma db seed
```

Or use the seed script directly via the Render shell.

---

## Future Improvements

- **WebSocket real-time updates** — push issue changes to all connected tenant users via Socket.IO rooms keyed by `tenantId`
- **Email notifications** — notify assignees on issue creation/update via SendGrid or Resend
- **Subdomain-based tenant routing** — `acme.trackflow.app` resolves `tenantSlug` from the hostname instead of JWT
- **Audit log** — track who changed what and when for compliance
- **File attachments** — attach screenshots/logs to issues via S3-compatible storage
- **Activity timeline** — chronological comments and status changes per issue
