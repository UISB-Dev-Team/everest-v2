# DormPay v2 (`everest-v2`) — Project Overview

## 1. Purpose and Core Problem Solved

**DormPay** (repository name: `everest-v2`) is a multi-dormitory financial management, billing, fine tracking, event fee collection, expense logging, and semester clearance web platform built for university dormitories at **Visayas State University (VSU)** by the Department of Computer Science and Technology (`UISB-Dev-Team`). [Sources: `README.md#L1-L3`, `package.json#L2`]

The platform centralizes dormitory accounting—replacing spreadsheet-based tracking of rent, surcharges, fines, events, expenses, and clearance status with an auditable, role-scoped web application. [Sources: `proxy.ts#L45-L95`, `features/dashboard/components/role-shell.tsx#L40-L130`, `supabase/migrations/20260804072843_remote_schema.sql#L1-L644`]

---

## 2. Target Users & Role Hierarchy

DormPay defines **6 roles** in the PostgreSQL `user_role_enum` (`'super_admin'`, `'adviser'`, `'treasurer'`, `'auditor'`, `'sa'`, `'dormer'`). [Source: `supabase/migrations/20260804072843_remote_schema.sql#L37-L44`]. These roles map to three portal tiers:

| Role (`user_role_enum`) | Portal Route Group | Scope | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`super_admin`** | `/(super-admin)/super-admin/*` | System-wide (all dormitories & periods) | Manage dormitories, room catalogs, academic periods (activate current semester), assign dormitory advisers, and manage global user account statuses. [Sources: `app/(super-admin)/super-admin/layout.tsx#L1-L15`, `proxy.ts#L33-L43`, `features/dashboard/components/super-admin-shell.tsx#L10-L45`] |
| **`adviser`** | `/(admin)/admin/*` | Single assigned dormitory | Full dormitory administration: enroll dormers, manage regular charges, generate bills, record payments/expenses/fines/events, issue clearances, and send semester summary emails. Can be flagged as `primary_adviser`. [Sources: `app/(admin)/admin/layout.tsx#L1-L15`, `proxy.ts#L55-L68`, `features/dashboard/components/admin-shell.tsx#L15-L55`, `supabase/migrations/20260804072843_remote_schema.sql#L254-L265`] |
| **`sa`** (Student Assistant) | `/(admin)/admin/*` | Single assigned dormitory | Full dormitory administration alongside the adviser (access to all `/admin/*` routes). [Sources: `app/(admin)/admin/layout.tsx#L9`, `proxy.ts#L55-L68`, `features/dashboard/components/admin-shell.tsx#L15-L55`] |
| **`treasurer`** | `/(admin)/admin/events` & `/admin/clearance` | Single assigned dormitory (restricted) | Restricted student officer role: strictly limited in both `proxy.ts` and `AdminShell` to **Events** and **Clearance** management. [Sources: `proxy.ts#L81-L91`, `features/dashboard/components/admin-shell.tsx#L25-L42`] |
| **`auditor`** | `/(admin)/admin/events` & `/admin/clearance` | Single assigned dormitory (restricted) | Restricted student officer role: shares the exact same route and navigation constraints as `treasurer`. [Sources: `proxy.ts#L81-L91`, `features/dashboard/components/admin-shell.tsx#L25-L42`] |
| **`dormer`** | `/(dormer)/*` | Personal enrollment in a dormitory | View personal financial dashboard, monthly bills & payment history, dormitory operational expenses (transparency view), personal fines, and semester clearance status. [Sources: `app/(dormer)/layout.tsx#L1-L15`, `proxy.ts#L69-L80`, `features/dashboard/components/dormer-shell.tsx#L10-L38`] |

---

## 3. High-Level Functionality

1. **Academic Period Scoping**: Almost all dormitory enrollments, regular charges, bills, payments, events, event payments, fines, fine impositions, expenses, and clearances are scoped to an `academic_period_id`. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L136-L470`]. The system enforces at most one active semester via a partial unique index. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L149-L150`].
2. **Dormitories & Room Catalogs**: Super Admins create dormitories with defined capacities and room rosters stored as comma-separated text. [Sources: `features/dormitories/data/supabase.ts#L1-L140`, `lib/hooks/useRooms.ts#L1-L55`, `supabase/migrations/20260804072843_remote_schema.sql#L154-L180`].
3. **Resident Onboarding & CSV Import**: Staff can enroll dormers individually or in bulk via an RFC 4180 CSV importer that verifies rooms, deduplicates emails, provisions Supabase Auth users via `supabaseAdmin.auth.admin.createUser`, creates profile/role/enrollment records, and sends welcome emails with login credentials. [Sources: `features/dormers/lib/import-dormers-csv.ts#L1-L120`, `features/dormers/data/supabase.ts#L1-L180`, `lib/csv/parse-csv.ts#L1-L125`].
4. **Regular Charges, Billing & Payment Collection**: Staff define recurring monthly or semester fee templates (`regular_charges`), generate individual or bulk bills (`bills`), record cash or online payments (`payments`), and dispatch email receipts. [Sources: `features/regular-charges/data/supabase.ts#L1-L90`, `features/payments/data/supabase.ts#L1-L220`, `lib/email.ts#L1-L60`].
5. **Dormitory Events & Contribution Tracking**: Staff create events (`events`), track individual resident contributions (`event_payments`), record payments, and notify residents by email. [Sources: `features/events/data/supabase.ts#L1-L240`, `emails/events/eventCreated.ts#L1-L50`].
6. **Violation Rules & Fine Impositions**: Staff maintain a catalog of fine rules (`fines`), impose fines individually or via CSV upload (`fine_impositions`), and record payments or waivers. [Sources: `features/fines/data/supabase.ts#L1-L210`, `features/fines/utils/csv-Rules.ts#L1-L130`].
7. **Expense Logging & Financial Transparency**: Staff log dormitory expenditures (`expenses`) and upload receipt images to the Supabase Storage bucket `receipt-images`. Residents have read-only access to inspect dormitory expenses and receipts for transparency. [Sources: `features/expenses/data/supabase.ts#L1-L140`, `app/(dormer)/expenses/page.tsx#L1-L15`].
8. **Semester Clearance**: Residents are evaluated for outstanding obligations (unpaid bills, unpaid fines, unpaid active events) for the current academic period, and staff can issue or revoke clearance certificates (`clearance_certificates`). [Sources: `features/clearance/data/supabase.ts#L1-L230`, `supabase/migrations/20260804072843_remote_schema.sql#L461-L470`].

---

## 4. System Boundaries

- **Application Server & Frontend**: A unified Next.js 16 App Router application hosting React 19 client components, Server Actions (`"use server"`), and Route Handlers. [Sources: `package.json#L12-L24`, `proxy.ts#L1-L95`, `app/auth/callback/route.ts#L1-L35`].
- **Database & Storage**: Managed Supabase PostgreSQL with 15 tables, 7 enums, 6 database functions, 5 triggers, Row Level Security, and the `receipt-images` storage bucket. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L1-L644`].
- **Email Delivery**: SMTP email dispatched through `nodemailer` via the `sendEmail` Server Action, configured with mandatory institutional CC to `dormpay@vsu.edu.ph`. [Sources: `lib/email.ts#L1-L60`, `emails/`].
