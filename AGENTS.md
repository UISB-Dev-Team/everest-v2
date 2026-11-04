<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DormPay v2 (`everest-v2`) — Agent & Developer Instructions

This is the central, agent-agnostic instruction file for AI coding agents and developers working on **DormPay v2**. Always follow these operating rules and consult the verified documentation in [`docs/ai-context/`](./docs/ai-context/) before making changes.

---

## 1. Project Context

**DormPay v2** (`everest-v2`) is a multi-dormitory financial management, billing, fine tracking, event fee collection, expense logging, and semester clearance web platform built for university dormitories at **Visayas State University (VSU)**. [Sources: `README.md#L1-L3`, `package.json#L2`]

- **Stack**: Next.js `16.2.6` (App Router, Turbopack, [`proxy.ts`](./proxy.ts)), React `19.2.4`, TypeScript `^5`, Tailwind CSS v4, `shadcn/ui` + Radix UI, Zustand, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), and `nodemailer`. [Sources: `package.json#L12-L35`, `proxy.ts#L1-L20`]
- **Roles (`user_role_enum`)**: `dormer`, `adviser`, `sa`, `treasurer`, `auditor`, `super_admin`. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L37-L44`]
- **Repository Contents**: 22 routes across 4 route groups in [`app/`](./app/), 13 domain feature slices in [`features/`](./features/), shared UI and hooks in [`components/ui/shared/`](./components/ui/shared/) and [`lib/`](./lib/), 14 HTML email templates in [`emails/`](./emails/), and Supabase migrations in [`supabase/migrations/`](./supabase/migrations/).

### How to Identify & Read Relevant Context Documents

Before planning or writing code, inspect the stable context files in [`docs/ai-context/`](./docs/ai-context/):

| Context Document | Read Before Working On... |
| :--- | :--- |
| [`docs/ai-context/project-overview.md`](./docs/ai-context/project-overview.md) | Domain concepts, role hierarchy, high-level capabilities, and system boundaries. |
| [`docs/ai-context/architecture.md`](./docs/ai-context/architecture.md) | Component communication, vertical slice boundaries, client vs. server adapters, and auth/request flows. |
| [`docs/ai-context/codebase-context.md`](./docs/ai-context/codebase-context.md) | Directory responsibilities, route map, shared UI components/hooks, and file lookup guide. |
| [`docs/ai-context/technical-context.md`](./docs/ai-context/technical-context.md) | Framework/library versions, Next.js 16 conventions, Supabase clients, SMTP email, and CSV engine. |
| [`docs/ai-context/functional-context.md`](./docs/ai-context/functional-context.md) | User workflows, role permissions, and business rules across all 13 features. |
| [`docs/ai-context/development-workflow.md`](./docs/ai-context/development-workflow.md) | Local setup, `.env.local`, npm scripts, verification commands, and troubleshooting. |
| [`docs/ai-context/database-context.md`](./docs/ai-context/database-context.md) | All 15 tables, 7 enums, 6 functions, 5 triggers, RLS policies, storage bucket, and migration rules. |

### Reusable Agent Skills (`.agents/skills/`)

Activate the matching skill when performing any of these repeatable procedures:
- [`dormpay-feature-development`](./.agents/skills/dormpay-feature-development/SKILL.md): Implementing or extending features, hooks, modals, pages, or routes.
- [`bug-investigation-and-debugging`](./.agents/skills/bug-investigation-and-debugging/SKILL.md): Diagnosing bugs, redirect loops, stuck loading skeletons, or calculation errors.
- [`supabase-schema-and-migrations`](./.agents/skills/supabase-schema-and-migrations/SKILL.md): Authoring SQL migrations, modifying RLS/schema, or regenerating `lib/supabase/database.types.ts`.
- [`auth-and-role-management`](./.agents/skills/auth-and-role-management/SKILL.md): Provisioning users, updating roles, or changing route guards (`proxy.ts`, `AuthGuard`).
- [`csv-import-export`](./.agents/skills/csv-import-export/SKILL.md): Building or updating RFC 4180 CSV imports and formula-safe CSV exports.

---

## 2. Development Rules

1. **Audit Before Modifying**: Inspect the actual files in `features/`, `app/`, and `docs/ai-context/` before proposing or making changes. Do not assume documentation is accurate if implementation code contradicts it — investigate and report discrepancies.
2. **Follow Established Architecture & Naming Conventions**:
   - Keep `app/**/page.tsx` routes as thin 5–15 line wrappers (awaiting `params`/`searchParams` Promises in Next.js 16).
   - Place all Supabase queries in `features/<name>/data/supabase.ts` and expose them through the **Data-Access Seam** (`features/<name>/data/index.ts` -> `<feature>Data`).
   - Keep data fetching, filtering, pagination, and toast notifications inside `features/<name>/hooks/use*.ts`.
   - Keep tables (`*-table.tsx`) and modals (`*-modal.tsx`) purely presentational (driven by props).
3. **Prefer Focused, Incremental Changes**: Avoid broad rewrites, unnecessary abstractions, duplicated logic, or new dependencies. Reuse [`components/ui/shared/`](./components/ui/shared/), [`lib/format.ts`](./lib/format.ts), [`lib/table-utils.ts`](./lib/table-utils.ts), and [`lib/csv/parse-csv.ts`](./lib/csv/parse-csv.ts).
4. **Preserve Existing Behavior & Unrelated Files**: Do not modify unrelated files or alter existing behavior unless the task explicitly requires it.

---

## 3. Planning and Implementation

1. **Scale Workflow to Complexity**: For simple, localized fixes, inspect and implement directly. For nontrivial or cross-cutting tasks, inspect the affected components first and produce a concise implementation plan.
2. **What to Identify in a Plan**:
   - Affected routes, feature slices, hooks, and database tables.
   - Role & permission impact (`dormer`, `adviser`, `sa`, `treasurer`, `auditor`, `super_admin`).
   - Risks (e.g., client vs. server role synchronization, RLS impact, academic period scoping).
   - Exact verification steps.
3. **Approval Gate**: Do not begin broad refactors, schema modifications, or risky implementations before the plan is reviewed when user approval is required.

---

## 4. Verification

1. **Available Commands ([`package.json`](./package.json))**:
   - **Route Typegen & Type Check**: `npm run typecheck` (`next typegen && tsc --noEmit`) — must pass with **0 errors**.
   - **Targeted Lint**: `npx eslint <path/to/modified/files>` — ensure modified files introduce **0 ESLint errors** (especially React 19 `react-hooks/set-state-in-effect` and `@typescript-eslint/no-explicit-any`).
   - **Full Workspace Lint**: `npm run lint` (`eslint`).
   - **Production Build**: `npm run build` (`next build`).
   - **Tests**: No automated test runner is currently configured in `package.json`.
2. **Honest Reporting**: Run relevant checks after making code changes. Never claim a check passed unless it was actually executed and succeeded. Clearly report any checks that could not be run.

---

## 5. Security and Environment Safety

1. **Strict Development vs. Production Separation**:
   - **Development Supabase Project Ref**: `<dev-project-ref>`
   - **Production Supabase Project Ref**: `<prod-project-ref>`
   - Treat production and development environments as strictly separate. Never use production credentials as a fallback for development, and never seed synthetic data into production.
   - Always check `supabase/.temp/project-ref` before running any `npx supabase` command. Require explicit user confirmation before any destructive or production-affecting operation.
2. **Secret & Data Protection**:
   - Never expose secrets, `.env.local` values, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_PASSWORD`, private user data, or session tokens (`access_token` / `refresh_token`) in logs, console output, documentation, or commits.
   - [`lib/supabase/admin.ts`](./lib/supabase/admin.ts) (`supabaseAdmin`) must **only** be imported in `"use server"` modules or server Route Handlers.
3. **Role Synchronization & Data Scoping**:
   - Server-side [`proxy.ts`](./proxy.ts) reads `role` from `public.dormitory_roles`, while client-side [`features/auth/data/supabase.ts`](./features/auth/data/supabase.ts) reads `user.user_metadata.role`. Any user creation or role/dormitory update must synchronize both `public.dormitory_roles` and `supabaseAdmin.auth.admin.*` (`user_metadata`).
   - Filter soft-deletable tables by `.eq("is_deleted", false)` and scope dormitory records by `dormitory_id` and `academic_period_id`.

---

## 6. Completion Report Format

At the conclusion of any task, provide a concise completion report containing:
1. **Summary of Changes**: What was accomplished and why.
2. **Important Files Modified**: Clickable links to created or updated files.
3. **Verification Performed and Actual Results**: Exact commands executed and their outputs (plus any checks not run).
4. **Risks, Limitations, or Unresolved Questions**: Any caveats or follow-up decisions needed.
5. **Documentation Updated**: Which files in `docs/ai-context/` or `AGENTS.md` were updated to keep repository context accurate.
