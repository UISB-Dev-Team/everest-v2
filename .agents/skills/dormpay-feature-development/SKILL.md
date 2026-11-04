---
name: dormpay-feature-development
description: Guides the end-to-end implementation or extension of features in DormPay v2 following the vertical feature-slice architecture (data seam, hooks, presentational components, route wrappers, role guards, academic period scoping, and email notifications). Use when adding a new feature module, page, modal, or data operation under features/ or app/.
---

# DormPay Feature Development Skill

Use this skill whenever implementing a new feature or modifying an existing domain slice in DormPay v2 (`everest-v2`).

## 1. Required Pre-Implementation Context

Before writing code, read the relevant AI context files:
1. [`docs/ai-context/architecture.md`](../../../docs/ai-context/architecture.md) & [`docs/ai-context/codebase-context.md`](../../../docs/ai-context/codebase-context.md) — Route map, feature anatomy, and shared UI primitives.
2. [`docs/ai-context/database-context.md`](../../../docs/ai-context/database-context.md) & [`docs/ai-context/technical-context.md`](../../../docs/ai-context/technical-context.md) — Database schema (15 tables, 7 enums), Supabase clients, and auth rules.
3. [`docs/ai-context/functional-context.md`](../../../docs/ai-context/functional-context.md) — Existing domain workflows and business rules.
4. For Next.js 16 App Router APIs (`proxy.ts`, async `params`/`searchParams`, Server Actions), check `node_modules/next/dist/docs/` as required by `AGENTS.md`.

---

## 2. Step-by-Step Implementation Workflow

### Step 1: Define Domain Types (`features/<feature>/data/types.ts`)
- Define TypeScript interfaces for domain records and `Create*Input` / `Update*Input` DTOs.
- Align field names and enum unions with [`lib/supabase/database.types.ts`](../../../lib/supabase/database.types.ts).

### Step 2: Implement the Supabase Data Adapter (`features/<feature>/data/supabase.ts`)
- **Choose Execution Mode Deliberately**:
  - Add `"use server";` at line 1 if the module needs `supabaseAdmin` ([`lib/supabase/admin.ts`](../../../lib/supabase/admin.ts)) for privileged Auth/Storage operations (`auth.admin.*`, `receipt-images` upload) or direct server-side execution.
  - Never import `supabaseAdmin` in a file without `"use server";`.
- **Scope Queries Properly**:
  - Always scope dormitory-level queries by `.eq("dormitory_id", dormitoryId)` and `.eq("academic_period_id", academicPeriodId)`.
  - Always exclude soft-deleted records using `.eq("is_deleted", false)` on tables with `is_deleted` (`academic_periods`, `dormitories`, `regular_charges`, `bills`, `events`, `event_payments`, `fines`, `expenses`).
- **Expose via the Data-Access Seam (`features/<feature>/data/index.ts`)**:
  ```ts
  import * as supabase from "./supabase";
  export const <feature>Data = supabase;
  export * from "./types";
  ```

### Step 3: Create Stateful Hooks (`features/<feature>/hooks/`)
- Keep data fetching, client-side filtering/pagination, and mutation state inside hooks:
  - `use<Feature>Data.ts`: Fetches records using `<feature>Data`, scoped by `useDormitory()` ([`lib/hooks/useDormitory.ts`](../../../lib/hooks/useDormitory.ts)) and `useAcademicPeriods()` ([`features/academic-periods/hooks/useAcademicPeriods.ts`](../../../features/academic-periods/hooks/useAcademicPeriods.ts)).
  - `use<Feature>Actions.ts`: Wraps create/update/delete calls with loading flags and `toast.success` / `toast.error` from `sonner`.
  - `use<Feature>Table.ts`: Manages search, filter, sort, and pagination using helpers from [`lib/table-utils.ts`](../../../lib/table-utils.ts).
- **React 19 Lint Rule (`react-hooks/set-state-in-effect`)**:
  - Avoid calling `setState` synchronously at the top level of a `useEffect` body (which triggers ESLint errors under React 19). Initialize state directly in `useState(...)`, derive values during render with `useMemo`, or update state inside async promise callbacks.

### Step 4: Build Presentational Components & Page Orchestrator (`features/<feature>/components/`)
- Place role-specific components in `components/admin/`, `components/dormer/`, or `components/super-admin/`.
- **Reuse Shared UI Components** from [`components/ui/shared/`](../../../components/ui/shared/):
  - `PageHeader`, `StatCard`, `TableToolbar`, `TableFooter`, `TableEmptyState`, `EmptyState`, `ConfirmDialog`, `ProgressModal`.
- Format currency with `formatCurrency` (`₱`) and dates with `formatDate` from [`lib/format.ts`](../../../lib/format.ts).
- Presentational tables (`*-table.tsx`) and modals (`*-modal.tsx`) must accept data and callbacks via props and **never** call `<feature>Data` or Supabase directly.

### Step 5: Wire the Route & Role Guards (`app/` & `proxy.ts`)
- Create a thin route wrapper in the appropriate route group:
  - Dormer: `app/(dormer)/<route>/page.tsx`
  - Admin: `app/(admin)/admin/<route>/page.tsx`
  - Super Admin: `app/(super-admin)/super-admin/<route>/page.tsx`
- In Next.js 16, dynamic route `params` and `searchParams` are `Promise<...>` and must be awaited (`const { id } = await params;` or `use(params)`).
- If adding a new top-level route:
  1. Add it to the appropriate route matcher in [`proxy.ts`](../../../proxy.ts) (including checking whether `treasurer` and `auditor` should be allowed or blocked).
  2. Add the navigation item to [`dormer-shell.tsx`](../../../features/dashboard/components/dormer-shell.tsx), [`admin-shell.tsx`](../../../features/dashboard/components/admin-shell.tsx), or [`super-admin-shell.tsx`](../../../features/dashboard/components/super-admin-shell.tsx).

### Step 6: Transactional Email Notifications (If Applicable)
- Add or update HTML string templates in `emails/<domain>/<templateName>.ts`.
- Call `sendEmail({ to, subject, html })` from [`lib/email.ts`](../../../lib/email.ts) inside a `try / catch` block so non-fatal SMTP failures do not roll back completed database writes.

---

## 3. Verification Checklist

1. Run `npm run typecheck` (`next typegen && tsc --noEmit`) and confirm **0 errors**.
2. Run `npx eslint <modified-files>` to verify zero lint errors or React 19 hook violations in touched files.
3. Update [`docs/ai-context/functional-context.md`](../../../docs/ai-context/functional-context.md) if routes or feature capabilities changed.
