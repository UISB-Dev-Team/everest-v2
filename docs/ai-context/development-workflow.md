# DormPay v2 — Development Workflow

This document covers local setup, environment configuration, package scripts, verification workflows, and development troubleshooting in **DormPay v2 (`everest-v2`)**.

---

## 1. Prerequisites and Installation

- **Node.js**: v20+ (LTS recommended).
- **Package Manager**: `npm` (the repository tracks [`package-lock.json`](../../package-lock.json)).
- **Database Access**: Active credentials for the DormPay **development** Supabase project (`<dev-project-ref>`). Never use the production project (`<prod-project-ref>`) for local development or testing.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env.local (see Section 2)

# 3. Verify route typegen and TypeScript compiler checks
npm run typecheck

# 4. Start local development server
npm run dev
```

The application runs at `http://localhost:3000`. [Source: `package.json#L6`].

---

## 2. Environment Configuration (`.env.local`)

Create `.env.local` in the repository root (gitignored via `.env*` in [`.gitignore`](../../.gitignore#L30)):

```dotenv
# Supabase Development Project (<dev-project-ref>)
NEXT_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>

# SMTP Configuration (lib/email.ts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<smtp-email>
SMTP_PASSWORD=<smtp-app-password>
SMTP_FROM_EMAIL="DormPay <dormpay@vsu.edu.ph>"
```

### Environment Security Rules
1. **Never Fall Back to Production**: Keep development and production project keys strictly isolated. Never populate local `.env.local` with production `SUPABASE_SERVICE_ROLE_KEY`.
2. **Server-Only Variables**: `SUPABASE_SERVICE_ROLE_KEY` and `SMTP_PASSWORD` must never be prefixed with `NEXT_PUBLIC_` or imported into client components. [Sources: `lib/supabase/admin.ts#L6-L10`, `lib/email.ts#L11-L20`].
3. **Institutional CC Warning**: [`lib/email.ts#L36`](../../lib/email.ts#L36) automatically CCs `dormpay@vsu.edu.ph` on all outgoing emails when valid SMTP credentials exist. Use synthetic test recipient addresses when testing email workflows.

---

## 3. Package Scripts & Verification Commands

Defined in [`package.json`](../../package.json#L5-L10):

| Command | Definition in `package.json` | Purpose | Verified Status |
| :--- | :--- | :--- | :--- |
| `npm run dev` | `next dev` | Starts Next.js 16 development server (Turbopack default) | Working |
| `npm run build` | `next build` | Compiles Next.js production bundle | Working |
| `npm run start` | `next start` | Runs compiled production server | Working |
| `npm run typecheck` | `next typegen && tsc --noEmit` | Generates route types in `.next/types` and executes TypeScript compiler check | **Passes with 0 errors** |
| `npm run lint` | `eslint` | Runs ESLint across the repository | Working (exits with code 1 on pre-existing code) |
| `npx eslint <path>` | `eslint <path>` | Lints specific modified files to ensure zero new errors | Recommended for incremental changes |

*Testing note*: The repository does not currently have an automated unit or end-to-end test runner configured in `package.json`.

---

## 4. Database Migration Workflow

1. **Verify Linked Project Before CLI Operations**:
   Inspect `supabase/.temp/project-ref` to confirm it is set to `<dev-project-ref>` (development):
   ```powershell
   Get-Content supabase/.temp/project-ref
   npx supabase link --project-ref <dev-project-ref>
   ```
2. **Create a Timestamped Migration**:
   ```powershell
   npx supabase migration new <descriptive_name>
   ```
3. **Apply to Development**:
   ```powershell
   npx supabase db push
   ```
4. **Regenerate TypeScript Database Types in UTF-8**:
   The canonical type definitions are in [`lib/supabase/database.types.ts`](../../lib/supabase/database.types.ts).
   On Windows PowerShell, avoid `>` redirection (which writes UTF-16LE and breaks ESLint); use `Out-File -Encoding utf8`:
   ```powershell
   npx supabase gen types typescript --linked | Out-File -FilePath lib/supabase/database.types.ts -Encoding utf8
   ```

---

## 5. Development Troubleshooting

### Issue 1: Login Redirect Loop or Unauthorized Flash
- **Root Cause**: `proxy.ts` queries `public.dormitory_roles.role` on the server [Source: `proxy.ts#L45-L53`], while client-side `useAuth` reads `user.user_metadata.role` from the JWT [Source: `features/auth/data/supabase.ts#L11-L21`].
- **Resolution**: Ensure test accounts created in Supabase Auth have matching entries in **both** `auth.users.raw_user_meta_data` (`{"role": "<role>", "dormitory_id": "<uuid-or-null>", "full_name": "<name>"}`) and `public.dormitory_roles`.

### Issue 2: Infinite Loading Skeleton on Dashboard
- **Root Cause**: [`features/academic-periods/hooks/useAcademicPeriods.ts`](../../features/academic-periods/hooks/useAcademicPeriods.ts) looks for an academic period with `is_current = true`. If no active period exists in `public.academic_periods`, `currentPeriod` remains `null`, preventing dashboard snapshots from resolving.
- **Resolution**: Ensure at least one academic period exists in `public.academic_periods` with `is_current = true` and `is_deleted = false`.

### Issue 3: Typecheck Fails with Missing Route Types
- **Root Cause**: Running `tsc --noEmit` directly without `next typegen` fails because Next.js 16 creates required route types in `.next/types`.
- **Resolution**: Always run `npm run typecheck` (`next typegen && tsc --noEmit`). [Source: `package.json#L8`].
