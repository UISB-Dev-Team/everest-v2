---
name: bug-investigation-and-debugging
description: Guides systematic bug investigation, root-cause analysis, and safe bug fixing in DormPay v2 across Next.js 16 routes, proxy.ts, dual role resolution, client vs. server Supabase adapters, and academic period scoping. Use when investigating reported bugs, stuck loading states, redirect loops, or calculation discrepancies.
---

# Bug Investigation and Debugging Skill

Use this skill whenever diagnosing or fixing a bug, runtime error, redirect loop, infinite loading skeleton, or financial calculation discrepancy in DormPay v2 (`everest-v2`).

## 1. Required Pre-Investigation Context

1. [`docs/ai-context/architecture.md`](../../../docs/ai-context/architecture.md) — Two-tier auth flow (`proxy.ts` vs `AuthGuard`) and client vs. `"use server"` data adapters.
2. [`docs/ai-context/database-context.md`](../../../docs/ai-context/database-context.md) — Table relationships, enums, functions, and RLS behavior.
3. [`docs/ai-context/functional-context.md`](../../../docs/ai-context/functional-context.md) — Workflows and expected business rules.

---

## 2. Step-by-Step Diagnostic Procedure

### Step 1: Classify the Symptom Against DormPay's High-Risk Boundaries

| Symptom | Primary Suspects to Inspect First |
| :--- | :--- |
| **Redirect loop or bounce after login** | 1. Role mismatch between `auth.users.raw_user_meta_data.role` (read by [`features/auth/data/supabase.ts`](../../../features/auth/data/supabase.ts)) and `public.dormitory_roles.role` (read by [`proxy.ts`](../../../proxy.ts)).<br>2. Missing route entry in [`proxy.ts`](../../../proxy.ts) (`isDormerRoute`, `isAdminRoute`, `isSuperAdminRoute`, `isRestrictedStaff`). |
| **Infinite loading skeleton on a dashboard or table** | 1. No active academic period (`public.academic_periods` where `is_current = true` and `is_deleted = false`), causing `currentPeriod` in [`useAcademicPeriods`](../../../features/academic-periods/hooks/useAcademicPeriods.ts) to remain `null`.<br>2. Component condition checking `if (loading \|\| !snapshot)` when `loading` is `false` and `snapshot` resolved to `null`.<br>3. Missing `dormitory_enrollment` (for dormer) or `dormitory_roles` (for staff) in [`useDormitory`](../../../lib/hooks/useDormitory.ts). |
| **Data missing or stale for a dormitory/semester** | 1. Query in `features/<name>/data/supabase.ts` missing `.eq("dormitory_id", dormitoryId)` or `.eq("academic_period_id", academicPeriodId)`.<br>2. Soft-delete filter `.eq("is_deleted", false)` omitted or inverted.<br>3. Hook `useEffect` dependency array missing `currentPeriod?.id` or `dormitoryId`. |
| **Financial or clearance total mismatch** | 1. Enum filter mismatch (e.g., checking `status === "Unpaid"` instead of `status !== "Paid"` when `'Partial'` bills exist, or ignoring `'Waived'` on fines/event payments).<br>2. Unfiltered cross-dormitory query (e.g., querying `events` by `academic_period_id` without `dormitory_id`). |
| **Server Action or Storage failure** | 1. `"use server"` module calling `supabase` (`createBrowserClient` running as `anon`) for an operation that requires `supabaseAdmin` (`auth.admin.*` or `receipt-images` storage).<br>2. Unhandled `sendEmail` SMTP error outside a `try / catch` block. |

### Step 2: Trace the Vertical Slice End-to-End
1. Locate the route in `app/**/page.tsx`.
2. Inspect the page orchestrator (`features/<name>/components/*-page.tsx`).
3. Inspect the hook (`features/<name>/hooks/use*.ts`) for early returns (`if (!dormitoryId || !currentPeriod?.id) return;`), state resets, and dependency arrays.
4. Inspect the data adapter (`features/<name>/data/supabase.ts`) for exact Supabase filters, joins, and error handling.

### Step 3: Safety & Secret Rules During Debugging
- **Never** add `console.log` statements that print `session`, `access_token`, `refresh_token`, `SUPABASE_SERVICE_ROLE_KEY`, or user passwords.
- **Never** test destructive reproductions against the production Supabase project (`<prod-project-ref>`).

### Step 4: Implement a Minimal, Root-Cause Fix
- Fix the underlying cause in the appropriate layer (`data/supabase.ts`, `hooks/`, or `proxy.ts`) without refactoring unrelated code.
- Ensure any fix in a React hook complies with React 19 ESLint rules (avoid synchronous `setState` at the top level of `useEffect`).

---

## 3. Verification Checklist

1. Run `npm run typecheck` (`next typegen && tsc --noEmit`) — must pass with **0 errors**.
2. Run `npx eslint <modified-files>` — must pass with **0 errors** in touched files.
