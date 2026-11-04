# DormPay v2 (`everest-v2`)

Multi-dormitory financial management, billing, event fee tracking, expense logging, fine management, and semester clearance platform for **Visayas State University (VSU)** dormitories. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase (PostgreSQL, Auth, Storage)**.

> **AI Agents & Developers**: Start with [`AGENTS.md`](./AGENTS.md) and the verified documentation in [`docs/ai-context/`](./docs/ai-context/) for architecture, database schema, role permissions, and development workflow.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure .env.local (pointing to the DormPay DEVELOPMENT Supabase project)
# See docs/ai-context/development-workflow.md for the full environment template.

# 3. Verify route types & TypeScript compilation
npm run typecheck   # runs `next typegen && tsc --noEmit`

# 4. Start the Next.js 16 Turbopack dev server
npm run dev         # http://localhost:3000
```

### Required Environment Variables (`.env.local`)

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-app-password>
SMTP_FROM_EMAIL="DormPay <dormpay@vsu.edu.ph>"
```

---

## Routes & Role Access (22 Routes)

DormPay serves **6 roles** (`dormer`, `adviser`, `sa`, `treasurer`, `auditor`, `super_admin`) across 4 route groups, enforced by [`proxy.ts`](./proxy.ts) on the server and [`AuthGuard`](./features/auth/components/auth-guard.tsx) on the client:

| Route Group | URLs | Allowed Roles |
| :--- | :--- | :--- |
| **Public / Auth** | `/login`, `/forgot-password`, `/update-password`, `/auth/callback` | Public / Recovery Session |
| **Dormer Portal** | `/dashboard`, `/payments`, `/expenses`, `/fines`, `/clearance` | `dormer` |
| **Admin Portal (Full)** | `/admin/dashboard`, `/admin/dormers`, `/admin/payments`, `/admin/expenses`, `/admin/fines` | `adviser`, `sa` |
| **Admin Portal (Events & Clearance)** | `/admin/events`, `/admin/events/all-events`, `/admin/events/[id]`, `/admin/clearance` | `adviser`, `sa`, `treasurer`, `auditor` |
| **Super Admin Portal** | `/super-admin/dashboard`, `/super-admin/academic-periods`, `/super-admin/dormitories`, `/super-admin/advisers`, `/super-admin/accounts` | `super_admin` |

`/` redirects to `/dashboard` (which proxies authenticated users to their role's home route defined in [`features/auth/lib/role-home.ts`](./features/auth/lib/role-home.ts)).

---

## Architecture & Directory Structure

```text
app/                              # Next.js 16 App Router — thin route wrappers & layouts
  (auth)/{login,forgot-password}/page.tsx
  (dormer)/{dashboard,payments,expenses,fines,clearance}/page.tsx
  (admin)/admin/{dashboard,dormers,payments,expenses,events,fines,clearance}/...
  (super-admin)/super-admin/{dashboard,academic-periods,dormitories,advisers,accounts}/page.tsx
  auth/callback/route.ts
  update-password/page.tsx
  layout.tsx
  page.tsx

features/                         # 13 vertical domain slices
  academic-periods/               # Semester CRUD, activation, & Zustand global store
  accounts/                       # Super Admin user directory & ban/unban Server Actions
  advisers/                       # Adviser provisioning, promotion, & dormitory assignment
  auth/                           # Login, password recovery, useAuth, & AuthGuard
  clearance/                      # Semester clearance calculation & certificate issuance
  dashboard/                      # Role dashboards (Dormer, Admin, Super Admin) & RoleShells
  dormers/                        # Dormer enrollment, CSV import, room assignment, & bills modal
  dormitories/                    # Dormitory & room catalog management
  events/                         # Dormitory events & contribution tracking
  expenses/                       # Operational expenses & receipt image uploads (Storage)
  fines/                          # Fine catalog, single/CSV fine impositions, & payments
  payments/                       # Monthly/bulk bill generation, payment recording, & CSV export
  regular-charges/                # Recurring dormitory fee templates

components/ui/                    # shadcn/ui primitives + shared composite components (components/ui/shared/)
emails/                           # 14 HTML string email templates sent via lib/email.ts (Nodemailer)
lib/                              # Supabase clients, RFC 4180 CSV parser, hooks, formatters
supabase/migrations/              # PostgreSQL schema migrations
docs/ai-context/                  # Verified developer & AI-agent documentation
.agents/skills/                   # Workspace AI coding skills
```

---

## Developer Documentation & AI Context

Stable context documentation is maintained in [`docs/ai-context/`](./docs/ai-context/):

- [`project-overview.md`](./docs/ai-context/project-overview.md) — Purpose, role hierarchy, domain model, and system boundaries.
- [`architecture.md`](./docs/ai-context/architecture.md) — Component communication, vertical slice boundaries, client vs. server adapters, and auth flows.
- [`codebase-context.md`](./docs/ai-context/codebase-context.md) — Route map, feature module anatomy, shared components, and file lookup table.
- [`technical-context.md`](./docs/ai-context/technical-context.md) — Framework versions, Next.js 16 conventions, Supabase clients, SMTP email, and CSV engine.
- [`functional-context.md`](./docs/ai-context/functional-context.md) — Workflows and business rules for all 13 feature modules.
- [`development-workflow.md`](./docs/ai-context/development-workflow.md) — Local setup, `.env.local`, verification commands, and troubleshooting.
- [`database-context.md`](./docs/ai-context/database-context.md) — All 15 database tables, 7 enums, 6 functions, 5 triggers, RLS policies, and migration conventions.
