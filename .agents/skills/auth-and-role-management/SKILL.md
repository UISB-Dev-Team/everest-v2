---
name: auth-and-role-management
description: Guides changes to authentication, user provisioning, role assignments, and route authorization across Supabase Auth user_metadata, public.profiles, public.dormitory_roles, proxy.ts, and AuthGuard. Use whenever touching login, account creation, role promotion, user deactivation/banning, or route access control.
---

# Auth and Role Management Skill

Use this skill whenever modifying user provisioning, role updates, authentication state, or route access guards in DormPay v2.

## 1. Required Pre-Implementation Context

1. [`docs/ai-context/architecture.md`](../../../docs/ai-context/architecture.md) — Two-tier authentication and role-resolution architecture.
2. [`docs/ai-context/technical-context.md`](../../../docs/ai-context/technical-context.md) — Supabase client configurations and Next.js 16 conventions.
3. Key implementation files:
   - [`proxy.ts`](../../../proxy.ts) (Server-side route guard)
   - [`features/auth/data/supabase.ts`](../../../features/auth/data/supabase.ts) (Client-side `mapSupabaseUser` and `useSyncExternalStore` session store)
   - [`features/auth/components/auth-guard.tsx`](../../../features/auth/components/auth-guard.tsx) (Client-side route layout guard)
   - [`features/auth/lib/role-home.ts`](../../../features/auth/lib/role-home.ts) (`ROLE_HOME` mapping for all 6 roles)

---

## 2. The Dual-Source Role Rule

DormPay resolves a user's role in **two different places**:
1. **Server-Side (`proxy.ts`)**: Queries `public.dormitory_roles` (`SELECT role FROM public.dormitory_roles WHERE user_id = user.id`). [Source: `proxy.ts#L45-L53`].
2. **Client-Side (`features/auth/data/supabase.ts`)**: Reads `user.user_metadata.role` from the Supabase Auth JWT (defaulting to `"dormer"` if missing). [Source: `features/auth/data/supabase.ts#L8-L22`].

**Every operation that creates a user or changes a user's role or dormitory assignment MUST update all three records in lockstep:**
1. `auth.users.raw_user_meta_data` (via `supabaseAdmin.auth.admin.createUser` or `supabaseAdmin.auth.admin.updateUserById`)
2. `public.profiles` (`id`, `first_name`, `last_name`, `email`, `phone`, `is_active`)
3. `public.dormitory_roles` (`user_id`, `dormitory_id`, `role`, `is_active`)

### Valid `user_role_enum` Values & Home Routes

| Role (`user_role_enum`) | `ROLE_HOME[role]` | Allowed Route Groups |
| :--- | :--- | :--- |
| `dormer` | `/dashboard` | `/dashboard`, `/payments`, `/expenses`, `/fines`, `/clearance` |
| `adviser` | `/admin/dashboard` | All `/admin/*` routes |
| `sa` | `/admin/dashboard` | All `/admin/*` routes |
| `treasurer` | `/admin/events` | Restricted to `/admin/events*` and `/admin/clearance*` |
| `auditor` | `/admin/events` | Restricted to `/admin/events*` and `/admin/clearance*` |
| `super_admin` | `/super-admin/dashboard` | All `/super-admin/*` routes |

---

## 3. Standard Patterns for User & Role Operations

### 3.1 Provisioning a New User (`"use server"` Action)
```ts
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: input.email,
  password: generatedPassword,
  email_confirm: true,
  user_metadata: {
    full_name: `${input.first_name} ${input.last_name}`.trim(),
    role: input.role, // 'dormer' | 'adviser' | 'sa' | 'treasurer' | 'auditor' | 'super_admin'
    dormitory_id: input.dormitory_id ?? null,
  },
});
```
Followed immediately by:
1. Upserting `public.profiles` (`id: authData.user.id`, `is_active: true`, ...).
2. Upserting `public.dormitory_roles` (`user_id: authData.user.id`, `role: input.role`, `dormitory_id: input.dormitory_id`, `is_active: true`).

### 3.2 Updating a User's Role or Dormitory
Whenever `public.dormitory_roles.role` or `dormitory_id` is updated (e.g., promoting a dormer to `sa`/`treasurer`/`auditor` in [`features/dormers/data/supabase.ts`](../../../features/dormers/data/supabase.ts) or editing an adviser in [`features/advisers/data/supabase.ts`](../../../features/advisers/data/supabase.ts)), always sync Auth metadata:
```ts
await supabaseAdmin.auth.admin.updateUserById(userId, {
  user_metadata: {
    full_name: `${firstName} ${lastName}`.trim(),
    role: newRole,
    dormitory_id: newDormitoryId,
  },
});
```

### 3.3 Deactivating / Banning an Account
See [`features/accounts/actions/user-actions.ts`](../../../features/accounts/actions/user-actions.ts):
- Update `public.profiles.is_active` (`false` or `true`).
- Call `supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: shouldBan ? "876000h" : "none" })`.

### 3.4 Modifying Route Access Rules
When adding or changing route permissions, update all three enforcement layers:
1. [`proxy.ts`](../../../proxy.ts) (`isDormerRoute`, `isAdminRoute`, `isSuperAdminRoute`, and `isRestrictedStaff` checks).
2. Route group layout `AuthGuard` (`app/(dormer)/layout.tsx`, `app/(admin)/admin/layout.tsx`, `app/(super-admin)/super-admin/layout.tsx`).
3. Navigation shells (`dormer-shell.tsx`, `admin-shell.tsx`, `super-admin-shell.tsx`).

---

## 4. Verification Checklist

1. Confirm no session tokens (`access_token`, `refresh_token`) or passwords are logged via `console.log`.
2. Run `npm run typecheck` and `npx eslint <modified-files>`.
3. Verify that both `proxy.ts` and `AuthGuard` agree on allowed roles and redirect targets (`ROLE_HOME`).
