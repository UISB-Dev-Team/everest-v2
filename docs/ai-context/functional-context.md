# DormPay v2 — Functional Context

This document details verified user workflows, role permissions, business rules, and operational boundaries across all **13 feature modules** under `features/`.

---

## 1. Authentication & Session Recovery (`features/auth/`)

- **Routes**: `/login`, `/forgot-password`, `/update-password`, `/auth/callback` [Sources: `app/(auth)/login/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `app/update-password/page.tsx`, `app/auth/callback/route.ts`].
- **Workflows**:
  - **Sign In**: User submits email/password on `LoginForm`; `signInWithPassword` authenticates via Supabase; on success, the client navigates to `ROLE_HOME[user.role]`. [Sources: `features/auth/components/login-form.tsx#L50-L80`, `features/auth/lib/role-home.ts#L1-L20`].
  - **Password Recovery**: User submits email on `ForgotPasswordForm`; `resetPasswordForEmail` directs the recovery link to `/auth/callback?next=/update-password`; the route handler exchanges the PKCE `code` and sets the session cookie; the user completes the reset on `UpdatePasswordForm`. [Sources: `features/auth/data/supabase.ts#L128-L153`, `app/auth/callback/route.ts#L8-L30`].
- **Business Rules**:
  - `proxy.ts` verifies authenticated role against `public.dormitory_roles` and redirects to `ROLE_HOME`. [Source: `proxy.ts#L45-L95`].
  - Client-side `mapSupabaseUser` reads `user.user_metadata.role` (defaulting to `"dormer"` if null). [Source: `features/auth/data/supabase.ts#L8-L22`].

---

## 2. Academic Periods Management (`features/academic-periods/`)

- **Route**: `/super-admin/academic-periods` (Restricted to `super_admin`) [Sources: `app/(super-admin)/super-admin/academic-periods/page.tsx`, `app/(super-admin)/super-admin/layout.tsx`].
- **Workflows & Rules**:
  - Super Admin performs full CRUD on academic periods (`academic_year`, `semester`, `start_date`, `end_date`). [Source: `features/academic-periods/data/supabase.ts#L1-L85`].
  - Activating a semester calls `setCurrentPeriod(id)` which resets `is_current = false` on all periods before setting `is_current = true` on the selected period. [Source: `features/academic-periods/data/supabase.ts#L55-L75`].
  - Enforced by database constraint: `CHECK (end_date > start_date)`, `UNIQUE (academic_year, semester)`, and partial unique index `uix_one_current_period` where `is_current = true`. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L148-L151`].
  - Periods are soft-deleted via `is_deleted = true`. [Source: `features/academic-periods/data/supabase.ts#L80`].

---

## 3. Dormitories & Room Catalogs (`features/dormitories/`)

- **Route**: `/super-admin/dormitories` (Restricted to `super_admin`) [Sources: `app/(super-admin)/super-admin/dormitories/page.tsx`, `app/(super-admin)/super-admin/layout.tsx`].
- **Workflows & Rules**:
  - Super Admin configures dormitories (`name`, `location`, `capacity > 0`). [Sources: `features/dormitories/data/supabase.ts#L1-L140`, `supabase/migrations/20260804072843_remote_schema.sql#L154-L167`].
  - Room names are stored in `public.rooms` as comma-separated text in `room_names`. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L170-L177`].
  - Table displays live resident occupancy computed from `dormitory_enrollment` where `status = 'active'` in the current academic period. [Source: `features/dormitories/data/supabase.ts#L30-L75`].

---

## 4. Advisers Administration (`features/advisers/`)

- **Route**: `/super-admin/advisers` (Restricted to `super_admin`) [Sources: `app/(super-admin)/super-admin/advisers/page.tsx`, `app/(super-admin)/super-admin/layout.tsx`].
- **Workflows & Rules**:
  - **Create Adviser**: Generates a random 12-character temporary password, creates Auth user via `supabaseAdmin.auth.admin.createUser` (`user_metadata: { full_name, role: 'adviser', dormitory_id }`), creates `profiles` and `dormitory_roles` entries, and emails `adviserWelcomeTemplate`. [Source: `features/advisers/data/supabase.ts#L120-L180`].
  - **Promote Primary Adviser**: Demotes current primary adviser (`primary_adviser = false`), sets `primary_adviser = true` for target adviser, and sends `adviserPromotionTemplate`. [Source: `features/advisers/data/supabase.ts#L185-L220`].

---

## 5. Global User Accounts Management (`features/accounts/`)

- **Route**: `/super-admin/accounts` (Restricted to `super_admin`) [Sources: `app/(super-admin)/super-admin/accounts/page.tsx`, `app/(super-admin)/super-admin/layout.tsx`].
- **Workflows & Rules**:
  - Server component calls `getUsers()` joining `profiles`, `dormitory_roles`, and `dormitories`. [Sources: `app/(super-admin)/super-admin/accounts/page.tsx#L12-L20`, `features/accounts/actions/user-actions.ts#L10-L40`].
  - Super Admin can filter by role/status and toggle ban status (`toggleUserBan`), which updates `profiles.is_active` and applies or clears a 100-year Supabase Auth ban (`ban_duration: "876000h"` vs `"none"`). [Source: `features/accounts/actions/user-actions.ts#L45-L95`].

---

## 6. Resident Dormers Management (`features/dormers/`)

- **Route**: `/admin/dormers` (Accessible to `adviser`, `sa`) [Sources: `app/(admin)/admin/dormers/page.tsx`, `app/(admin)/admin/layout.tsx`].
- **Workflows & Rules**:
  - **Single Dormer Creation**: Checks email existence; creates Auth user via `supabaseAdmin.auth.admin.createUser` (`role: 'dormer'`); inserts `profiles`, `dormitory_roles`, and `dormitory_enrollment` records; and emails `dormerWelcomeTemplate`. [Source: `features/dormers/data/supabase.ts#L90-L160`].
  - **Bulk CSV Import**: Validates CSV headers (`First Name`, `Last Name`, `Email`, `Phone`, `Room`, `Role`), validates rooms against dormitory roster, deduplicates emails, provisions accounts, and dispatches welcome emails via a 5-worker concurrent queue while reporting progress to `ProgressModal`. [Sources: `features/dormers/lib/import-dormers-csv.ts#L1-L120`, `features/dormers/data/supabase.ts#L220-L330`].
  - **Officer Promotion**: Staff can promote a dormer to `sa`, `treasurer`, or `auditor`, updating both `public.dormitory_roles` and `supabaseAdmin.auth.admin.updateUserById`. [Source: `features/dormers/data/supabase.ts#L165-L215`].
  - **Per-Dormer Bills Modal**: Staff open `BillsModal` to manage monthly bills directly for a selected dormer. [Source: `features/dormers/components/admin/bills-modal.tsx#L1-L150`].

---

## 7. Regular Charges Catalog (`features/regular-charges/`)

- **UI Location**: Embedded inside `/admin/dormers` via `RegularChargesSection` [Source: `features/regular-charges/components/admin/regular-charges-section.tsx#L1-L100`].
- **Workflows & Rules**:
  - Staff define recurring fee templates (`name`, `amount > 0`, `description`) scoped to `(dormitory_id, academic_period_id)`. [Source: `features/regular-charges/data/supabase.ts#L1-L85`].
  - Used as templates for monthly bill generation across residents. [Source: `features/dormers/hooks/useBills.ts#L40-L90`].

---

## 8. Billing & Payments Collection (`features/payments/`)

- **Routes**: `/admin/payments` (Staff), `/payments` (Dormers) [Sources: `app/(admin)/admin/payments/page.tsx`, `app/(dormer)/payments/page.tsx`].
- **Workflows & Rules**:
  - **Bulk Bill Generation**: Staff select regular charges and a billing period (`YYYY-MM` or semester code); `createBulkBills` inserts rows into `bills` for all active residents (skipping existing bills via unique constraint `uq_monthly_bill`) and sends `billCreatedTemplate` emails. [Source: `features/payments/data/supabase.ts#L30-L110`].
  - **Payment Recording**: Staff record cash/online payments; `recordPayment` inserts into `payments`, updates `bills.amount_paid`, transitions `bills.status` (`'Unpaid'`, `'Partial'`, `'Paid'`), and sends `paymentConfirmationTemplate`. [Source: `features/payments/data/supabase.ts#L115-L180`].
  - **CSV Export**: `exportPaymentsCsv` outputs formula-sanitized payment records to CSV. [Source: `features/payments/lib/export-payments-csv.ts#L1-L50`].

---

## 9. Dormitory Events (`features/events/`)

- **Routes**: `/admin/events`, `/admin/events/all-events`, `/admin/events/[id]` (Staff, including `treasurer` & `auditor`) [Sources: `app/(admin)/admin/events/page.tsx`, `proxy.ts#L81-L91`].
- **Workflows & Rules**:
  - Staff create events (`amount_due >= 0`, `due_date`); `createEvent` inserts pre-populated `Pending` rows in `event_payments` for all currently enrolled dormers and emails `eventCreatedTemplate`. [Source: `features/events/data/supabase.ts#L40-L100`].
  - In `AdminEventDetailPage`, staff record individual contributions (`Paid`, `Pending`, `Waived`) and send `eventPaymentTemplate` receipts. [Source: `features/events/data/supabase.ts#L105-L170`].

---

## 10. Fine Rules & Violations (`features/fines/`)

- **Routes**: `/admin/fines` (Staff), `/fines` (Dormers) [Sources: `app/(admin)/admin/fines/page.tsx`, `app/(dormer)/fines/page.tsx`].
- **Workflows & Rules**:
  - Staff maintain fine violation rules (`fines`) with default amounts. [Source: `features/fines/data/supabase.ts#L25-L75`].
  - Staff impose fines individually or via CSV upload (`fine_impositions`), linking to `dormitory_enrollment_id` and sending `fineImposedTemplate`. [Source: `features/fines/data/supabase.ts#L80-L150`].
  - Fines transition across status `'Unpaid' | 'Paid' | 'Waived'`; payment recording sends `finePaymentTemplate`. [Source: `features/fines/data/supabase.ts#L155-L200`].

---

## 11. Operational Expenses (`features/expenses/`)

- **Routes**: `/admin/expenses` (Staff), `/expenses` (Dormers) [Sources: `app/(admin)/admin/expenses/page.tsx`, `app/(dormer)/expenses/page.tsx`].
- **Workflows & Rules**:
  - Staff log expenses with category, description, amount, date, and optional receipt image upload to Supabase Storage bucket `receipt-images`. [Source: `features/expenses/data/supabase.ts#L15-L80`].
  - Dormers access `/expenses` in read-only mode for financial transparency, with CSV export capability. [Sources: `features/expenses/components/dormer/dormer-expense-page.tsx#L1-L120`, `features/expenses/lib/export-expenses-csv.ts#L1-L45`].

---

## 12. Semester Clearance (`features/clearance/`)

- **Routes**: `/admin/clearance` (Staff, including `treasurer` & `auditor`), `/clearance` (Dormers) [Sources: `app/(admin)/admin/clearance/page.tsx`, `proxy.ts#L81-L91`, `app/(dormer)/clearance/page.tsx`].
- **Workflows & Rules**:
  - Evaluates resident obligations: unpaid regular bills, unpaid fine impositions, and unpaid active events. [Source: `features/clearance/data/supabase.ts#L30-L100`].
  - Staff issue or revoke clearance certificates (`clearance_certificates`) individually or in bulk, dispatching `clearanceIssuedTemplate` or `clearanceRevokedTemplate`. [Source: `features/clearance/data/supabase.ts#L105-L160`].

---

## 13. Dashboards (`features/dashboard/`)

- **Routes**: `/dashboard` (Dormer), `/admin/dashboard` (Staff), `/super-admin/dashboard` (Super Admin) [Sources: `app/(dormer)/dashboard/page.tsx`, `app/(admin)/admin/dashboard/page.tsx`, `app/(super-admin)/super-admin/dashboard/page.tsx`].
- **Workflows & Rules**:
  - **Dormer Dashboard**: Displays total due, total paid, clearance badge, and itemized payable items (unpaid bills, active events, unpaid fines). [Sources: `features/dashboard/data/supabase.ts#L12-L50`, `features/dashboard/components/dormer-dashboard-page.tsx#L1-L80`].
  - **Admin Dashboard**: Computes dormitory KPIs (active residents, occupancy rate, collections vs receivables across bills/events/fines, total expenses, net funds). Includes **Send Summary Email** button that emails semester financials to the adviser. [Source: `features/dashboard/data/supabase.ts#L70-L190`].
  - **Super Admin Dashboard**: Aggregates system-wide counts (total dormitories, active residents, registered users, active semester label). [Source: `features/dashboard/data/supabase.ts#L195-L250`].
