# DormPay v2 — Codebase Context

This document outlines key directories, application entry points, route definitions, shared components/hooks, and file-lookup guidance in **DormPay v2 (`everest-v2`)**.

---

## 1. Key Directories and Responsibilities

| Directory / File | Responsibility | Authoritative Sources |
| :--- | :--- | :--- |
| [`proxy.ts`](../../proxy.ts) | Next.js 16 server request proxy (replaces `middleware.ts`). Manages Supabase session cookie refreshes, queries `public.dormitory_roles.role`, and enforces server redirects. | `proxy.ts#L1-L95` |
| [`app/`](../../app/) | Next.js 16 App Router route groups (`(auth)`, `(dormer)`, `(admin)`, `(super-admin)`), root layout, global styles, and `/auth/callback` PKCE exchange handler. | `app/` |
| [`features/`](../../features/) | **13 domain feature slices**, each housing its own components, stateful hooks, and data adapters (`data/supabase.ts` exported via `data/index.ts`). | `features/` |
| [`components/ui/`](../../components/ui/) | `shadcn/ui` + Radix UI primitives (`button.tsx`, `dialog.tsx`, `table.tsx`, `badge.tsx`, etc.). | `components/ui/` |
| [`components/ui/shared/`](../../components/ui/shared/) | DormPay shared composite UI (`PageHeader`, `StatCard`, `TableToolbar`, `TableFooter`, `TableEmptyState`, `EmptyState`, `ConfirmDialog`, `ProgressModal`). | `components/ui/shared/` |
| [`emails/`](../../emails/) | 14 pure TypeScript HTML email templates organized by domain. | `emails/` |
| [`lib/`](../../lib/) | Infrastructure: Supabase client factories (`lib/supabase/`), RFC 4180 CSV parser (`lib/csv/parse-csv.ts`), shared hooks (`lib/hooks/`), Nodemailer Server Action (`lib/email.ts`), and formatters (`lib/format.ts`). | `lib/` |
| [`supabase/migrations/`](../../supabase/migrations/) | Versioned PostgreSQL schema migrations. | `supabase/migrations/20260804072843_remote_schema.sql` |
| [`docs/ai-context/`](./) | Stable developer and AI-agent context documentation. | `docs/ai-context/` |
| [`.agents/skills/`](../../.agents/skills/) | Reusable workspace AI-agent skills (`SKILL.md`). | `.agents/skills/` |

---

## 2. Application Entry Points & Complete Route Map (22 Routes)

### Entry Points
- **Server Request Proxy**: [`proxy.ts`](../../proxy.ts#L18-L95) intercepts all page navigation requests.
- **Root Layout**: [`app/layout.tsx`](../../app/layout.tsx#L1-L45) imports Geist fonts, [`app/globals.css`](../../app/globals.css), and mounts the `sonner` `<Toaster />`.
- **Root Page**: [`app/page.tsx`](../../app/page.tsx#L1-L8) redirects `/` to `/dashboard`.

### Complete Route Map

| Route Group & Layout Guard | Path | Wrapper File | Rendered Component / Handler |
| :--- | :--- | :--- | :--- |
| **Public / Auth**<br>[`app/(auth)/layout.tsx`](../../app/(auth)/layout.tsx) | `/login`<br>`/forgot-password`<br>`/update-password`<br>`/auth/callback` | [`app/(auth)/login/page.tsx`](../../app/(auth)/login/page.tsx)<br>[`app/(auth)/forgot-password/page.tsx`](../../app/(auth)/forgot-password/page.tsx)<br>[`app/update-password/page.tsx`](../../app/update-password/page.tsx)<br>[`app/auth/callback/route.ts`](../../app/auth/callback/route.ts) | [`LoginPage`](../../features/auth/components/login-page.tsx)<br>[`ForgotPasswordForm`](../../features/auth/components/forgot-password-form.tsx)<br>[`UpdatePasswordForm`](../../features/auth/components/update-password-form.tsx)<br>`GET` PKCE Exchange Handler |
| **Dormer Portal**<br>[`app/(dormer)/layout.tsx`](../../app/(dormer)/layout.tsx)<br>`AuthGuard(["dormer"])` + `DormerShell` | `/dashboard`<br>`/payments`<br>`/expenses`<br>`/fines`<br>`/clearance` | [`app/(dormer)/dashboard/page.tsx`](../../app/(dormer)/dashboard/page.tsx)<br>[`app/(dormer)/payments/page.tsx`](../../app/(dormer)/payments/page.tsx)<br>[`app/(dormer)/expenses/page.tsx`](../../app/(dormer)/expenses/page.tsx)<br>[`app/(dormer)/fines/page.tsx`](../../app/(dormer)/fines/page.tsx)<br>[`app/(dormer)/clearance/page.tsx`](../../app/(dormer)/clearance/page.tsx) | [`DormerDashboardPage`](../../features/dashboard/components/dormer-dashboard-page.tsx)<br>[`DormerPaymentsPage`](../../features/payments/components/dormer/dormer-payments-page.tsx)<br>[`DormerExpensePage`](../../features/expenses/components/dormer/dormer-expense-page.tsx)<br>[`DormerFinesPage`](../../features/fines/components/dormer/dormer-fines-page.tsx)<br>[`DormerClearancePage`](../../features/clearance/components/dormer-clearance-page.tsx) |
| **Admin Portal**<br>[`app/(admin)/admin/layout.tsx`](../../app/(admin)/admin/layout.tsx)<br>`AuthGuard(["adviser","treasurer","auditor","sa"])` + `AdminShell` | `/admin/dashboard`<br>`/admin/dormers`<br>`/admin/payments`<br>`/admin/expenses`<br>`/admin/events`<br>`/admin/events/all-events`<br>`/admin/events/[id]`<br>`/admin/fines`<br>`/admin/clearance` | [`app/(admin)/admin/dashboard/page.tsx`](../../app/(admin)/admin/dashboard/page.tsx)<br>[`app/(admin)/admin/dormers/page.tsx`](../../app/(admin)/admin/dormers/page.tsx)<br>[`app/(admin)/admin/payments/page.tsx`](../../app/(admin)/admin/payments/page.tsx)<br>[`app/(admin)/admin/expenses/page.tsx`](../../app/(admin)/admin/expenses/page.tsx)<br>[`app/(admin)/admin/events/page.tsx`](../../app/(admin)/admin/events/page.tsx)<br>[`app/(admin)/admin/events/all-events/page.tsx`](../../app/(admin)/admin/events/all-events/page.tsx)<br>[`app/(admin)/admin/events/[id]/page.tsx`](../../app/(admin)/admin/events/[id]/page.tsx)<br>[`app/(admin)/admin/fines/page.tsx`](../../app/(admin)/admin/fines/page.tsx)<br>[`app/(admin)/admin/clearance/page.tsx`](../../app/(admin)/admin/clearance/page.tsx) | [`AdminDashboardPage`](../../features/dashboard/components/admin-dashboard-page.tsx)<br>[`AdminDormersPage`](../../features/dormers/components/admin/admin-dormers-page.tsx)<br>[`AdminPaymentsPage`](../../features/payments/components/admin/admin-payments-page.tsx)<br>[`AdminExpensesPage`](../../features/expenses/components/admin/admin-expenses-page.tsx)<br>[`AdminEventsPage`](../../features/events/components/admin/admin-events-page.tsx)<br>[`AdminAllEventsPage`](../../features/events/components/admin/admin-all-events-page.tsx)<br>[`AdminEventDetailPage`](../../features/events/components/admin/admin-event-detail-page.tsx)<br>[`AdminFinesPage`](../../features/fines/components/admin/admin-fines-page.tsx)<br>[`AdminClearancePage`](../../features/clearance/components/admin-clearance-page.tsx) |
| **Super Admin Portal**<br>[`app/(super-admin)/super-admin/layout.tsx`](../../app/(super-admin)/super-admin/layout.tsx)<br>`AuthGuard(["super_admin"])` + `SuperAdminShell` | `/super-admin/dashboard`<br>`/super-admin/academic-periods`<br>`/super-admin/dormitories`<br>`/super-admin/advisers`<br>`/super-admin/accounts` | [`app/(super-admin)/super-admin/dashboard/page.tsx`](../../app/(super-admin)/super-admin/dashboard/page.tsx)<br>[`app/(super-admin)/super-admin/academic-periods/page.tsx`](../../app/(super-admin)/super-admin/academic-periods/page.tsx)<br>[`app/(super-admin)/super-admin/dormitories/page.tsx`](../../app/(super-admin)/super-admin/dormitories/page.tsx)<br>[`app/(super-admin)/super-admin/advisers/page.tsx`](../../app/(super-admin)/super-admin/advisers/page.tsx)<br>[`app/(super-admin)/super-admin/accounts/page.tsx`](../../app/(super-admin)/super-admin/accounts/page.tsx) | [`SuperAdminDashboardPage`](../../features/dashboard/components/super-admin-dashboard-page.tsx)<br>[`AcademicPeriodsPage`](../../features/academic-periods/components/super-admin/academic-periods-page.tsx)<br>[`SuperAdminDormitoriesPage`](../../features/dormitories/components/super-admin/super-admin-dormitories-page.tsx)<br>[`SuperAdminAdvisersPage`](../../features/advisers/components/super-admin/super-admin-advisers-page.tsx)<br>[`AccountsPage`](../../features/accounts/components/accounts-page.tsx) |

---

## 3. Shared Components, Hooks & Utilities

### Shared Composite UI Components (`components/ui/shared/`)
- [`PageHeader`](../../components/ui/shared/page-header.tsx): Heading, subtitle, and action buttons slot.
- [`StatCard`](../../components/ui/shared/stat-card.tsx): KPI metric card with semantic color variants (`brand`, `emerald`, `amber`, `rose`, `blue`).
- [`TableToolbar`](../../components/ui/shared/table-toolbar.tsx): Search input, filter dropdowns, and sort selector.
- [`TableFooter`](../../components/ui/shared/table-footer.tsx): Pagination controls and item count summary.
- [`TableEmptyState`](../../components/ui/shared/table-empty-state.tsx) & [`EmptyState`](../../components/ui/shared/empty-state.tsx): Standard empty-state placeholders.
- [`ConfirmDialog`](../../components/ui/shared/confirm-dialog.tsx): Standard modal for confirmation of state-changing operations.
- [`ProgressModal`](../../components/ui/shared/progress-modal.tsx): Modal with animated progress bar for batch CSV imports.

### Shared Domain Hooks & Utilities
- [`useAuth`](../../features/auth/hooks/useAuth.ts#L1-L15): Subscribes to the client Auth store via `useSyncExternalStore`.
- [`useDormitory`](../../lib/hooks/useDormitory.ts#L1-L125): Resolves active `dormitoryId`, `dormitoryName`, `enrollmentId`, and `roomNumber`.
- [`useAcademicPeriods`](../../features/academic-periods/hooks/useAcademicPeriods.ts#L1-L80): Reads and switches `currentPeriod` in the global Zustand store ([`features/academic-periods/store.ts`](../../features/academic-periods/store.ts)).
- [`useRooms`](../../lib/hooks/useRooms.ts#L1-L55): Queries and parses comma-separated room rosters for a dormitory.
- [`lib/format.ts`](../../lib/format.ts#L1-L35): Currency formatting in Philippine Pesos (`₱`) via `formatCurrency` and date formatting via `formatDate`.
- [`lib/table-utils.ts`](../../lib/table-utils.ts#L1-L60): Client-side pagination and sorting utilities.
- [`lib/csv/parse-csv.ts`](../../lib/csv/parse-csv.ts#L1-L125): Byte-sniffing decoder (`readCsvBytes`) and RFC 4180 parser (`parseCsv`).

---

## 4. File Lookup Guide: Where to Inspect and Modify

| Task / Feature Target | Key Files to Inspect |
| :--- | :--- |
| **Route permissions or sidebar links** | [`proxy.ts`](../../proxy.ts#L25-L95), [`features/auth/lib/role-home.ts`](../../features/auth/lib/role-home.ts#L1-L20), [`admin-shell.tsx`](../../features/dashboard/components/admin-shell.tsx#L15-L55), [`dormer-shell.tsx`](../../features/dashboard/components/dormer-shell.tsx#L10-L40), [`super-admin-shell.tsx`](../../features/dashboard/components/super-admin-shell.tsx#L10-L45) |
| **Login, session mapping, or password reset** | [`features/auth/data/supabase.ts`](../../features/auth/data/supabase.ts#L1-L153), [`app/auth/callback/route.ts`](../../app/auth/callback/route.ts#L1-L35), [`features/auth/components/`](../../features/auth/components/) |
| **Academic period management & header switcher** | [`features/academic-periods/data/supabase.ts`](../../features/academic-periods/data/supabase.ts#L1-L85), [`features/academic-periods/store.ts`](../../features/academic-periods/store.ts#L1-L25), [`role-shell.tsx`](../../features/dashboard/components/role-shell.tsx#L40-L75) |
| **Dormitory CRUD & room catalogs** | [`features/dormitories/data/supabase.ts`](../../features/dormitories/data/supabase.ts#L1-L140), [`lib/hooks/useRooms.ts`](../../lib/hooks/useRooms.ts#L1-L55) |
| **Adviser creation, promotion, or assignment** | [`features/advisers/data/supabase.ts`](../../features/advisers/data/supabase.ts#L1-L260), [`features/advisers/hooks/useAdviserActions.ts`](../../features/advisers/hooks/useAdviserActions.ts#L1-L70) |
| **Global account directory & user banning** | [`features/accounts/actions/user-actions.ts`](../../features/accounts/actions/user-actions.ts#L1-L100), [`features/accounts/components/accounts-page.tsx`](../../features/accounts/components/accounts-page.tsx#L1-L150) |
| **Resident enrollment, officer promotion, CSV import** | [`features/dormers/data/supabase.ts`](../../features/dormers/data/supabase.ts#L1-L220), [`features/dormers/lib/import-dormers-csv.ts`](../../features/dormers/lib/import-dormers-csv.ts#L1-L120) |
| **Recurring dormitory fee templates** | [`features/regular-charges/data/supabase.ts`](../../features/regular-charges/data/supabase.ts#L1-L90), [`features/regular-charges/components/admin/regular-charges-section.tsx`](../../features/regular-charges/components/admin/regular-charges-section.tsx#L1-L120) |
| **Bill generation, payment recording, & CSV export** | [`features/payments/data/supabase.ts`](../../features/payments/data/supabase.ts#L1-L220), [`features/dormers/hooks/useBills.ts`](../../features/dormers/hooks/useBills.ts#L1-L120), [`features/payments/lib/export-payments-csv.ts`](../../features/payments/lib/export-payments-csv.ts#L1-L50) |
| **Dormitory events & event contributions** | [`features/events/data/supabase.ts`](../../features/events/data/supabase.ts#L1-L240), [`features/events/hooks/`](../../features/events/hooks/) |
| **Fine rules, fine impositions, & fine CSV import** | [`features/fines/data/supabase.ts`](../../features/fines/data/supabase.ts#L1-L210), [`features/fines/utils/csv-Rules.ts`](../../features/fines/utils/csv-Rules.ts#L1-L130) |
| **Expense logging, receipt upload, & CSV export** | [`features/expenses/data/supabase.ts`](../../features/expenses/data/supabase.ts#L1-L140), [`features/expenses/lib/export-expenses-csv.ts`](../../features/expenses/lib/export-expenses-csv.ts#L1-L45) |
| **Clearance calculation & certificate issuance** | [`features/clearance/data/supabase.ts`](../../features/clearance/data/supabase.ts#L1-L230), [`features/clearance/hooks/useClearance.ts`](../../features/clearance/hooks/useClearance.ts#L1-L75) |
| **SMTP email dispatch & HTML templates** | [`lib/email.ts`](../../lib/email.ts#L1-L60), [`emails/`](../../emails/) |
