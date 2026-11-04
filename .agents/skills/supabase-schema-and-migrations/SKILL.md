---
name: supabase-schema-and-migrations
description: Enforces safe Supabase database schema changes, migration authoring, RLS policy verification, environment separation (dev vs prod), and UTF-8 TypeScript type generation in DormPay v2. Use whenever creating or modifying SQL migrations, tables, enums, functions, triggers, RLS policies, or database.types.ts.
---

# Supabase Schema and Migrations Skill

Use this skill whenever inspecting, modifying, or syncing the DormPay Supabase PostgreSQL schema, migrations, RLS policies, or generated TypeScript types.

## 1. Required Pre-Implementation Context

1. [`docs/ai-context/database-context.md`](../../../docs/ai-context/database-context.md) — Complete reference of the 15 tables, 7 enums, 6 functions, 5 triggers, RLS policies, and storage buckets.
2. [`docs/ai-context/development-workflow.md`](../../../docs/ai-context/development-workflow.md) — Environment separation (`<dev-project-ref>` dev vs. `<prod-project-ref>` prod).
3. Baseline migration: [`supabase/migrations/20260804072843_remote_schema.sql`](../../../supabase/migrations/20260804072843_remote_schema.sql).

---

## 2. Mandatory Environment Safety Check (Step 0)

> [!CAUTION]
> **NEVER run destructive or write CLI commands against the production project (`<prod-project-ref>`) without explicit user authorization.**

Before running **any** `npx supabase` command (`db push`, `db reset`, `migration up`, `migration repair`), verify which project ref the workspace is currently linked to:

```powershell
Get-Content supabase/.temp/project-ref
```

- **Development Project Ref**: `<dev-project-ref>`
- **Production Project Ref**: `<prod-project-ref>`

If `supabase/.temp/project-ref` contains `<prod-project-ref>`, relink to the development project before proceeding:

```powershell
npx supabase link --project-ref <dev-project-ref>
```

---

## 3. Migration Authoring Workflow

### Step 1: Create a Timestamped Migration File
Never edit already-applied migrations in `supabase/migrations/` unless repairing an unapplied baseline. Create a new migration:

```powershell
npx supabase migration new <descriptive_snake_case_name>
```

### Step 2: Follow DormPay Schema Conventions
- **Primary Keys**: `uuid DEFAULT gen_random_uuid() NOT NULL` (except `rooms` and `clearance_certificates`, which use `bigint GENERATED ALWAYS AS IDENTITY`). [Source: `supabase/migrations/20260804072843_remote_schema.sql#L136-L470`].
- **Soft Deletes**: Use `is_deleted boolean DEFAULT false NOT NULL` rather than physical `DELETE` on core domain tables (`academic_periods`, `dormitories`, `regular_charges`, `bills`, `events`, `event_payments`, `fines`, `expenses`).
- **Updated Timestamps**: Attach the `public.set_updated_at()` trigger (`BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`) to tables with an `updated_at` column. [Source: `supabase/migrations/20260804072843_remote_schema.sql#L128-L133`].
- **RLS Policies**:
  - Enable RLS on all new tables: `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`.
  - Avoid self-referencing subqueries on `dormitory_roles` inside `dormitory_roles` policies (use `SECURITY DEFINER` helper functions `public.is_super_admin()`, `public.is_dorm_staff(dormitory_id)`, `public.my_dorm_role(dormitory_id)`).

### Step 3: Apply to Development & Verify
```powershell
# Confirm linked project is <dev-project-ref> first!
npx supabase db push
```

### Step 4: Regenerate TypeScript Types in UTF-8
The canonical database types file is [`lib/supabase/database.types.ts`](../../../lib/supabase/database.types.ts).

> [!WARNING]
> **Windows PowerShell UTF-16LE Trap**: Never use `npx supabase gen types ... > lib/supabase/database.types.ts` in PowerShell, because `>` defaults to UTF-16LE encoding and causes ESLint to fail with `Parsing error: File appears to be binary`.

Always pipe through `Out-File -Encoding utf8`:

```powershell
npx supabase gen types typescript --linked | Out-File -FilePath lib/supabase/database.types.ts -Encoding utf8
```

---

## 4. Verification Checklist

1. Run `npm run typecheck` to confirm all `features/*/data/supabase.ts` queries compile against the updated [`lib/supabase/database.types.ts`](../../../lib/supabase/database.types.ts).
2. Run `npx eslint lib/supabase/database.types.ts` to confirm the generated file is valid UTF-8 and not flagged as binary.
3. Update [`docs/ai-context/database-context.md`](../../../docs/ai-context/database-context.md) if tables, columns, enums, functions, or triggers were added or modified.
