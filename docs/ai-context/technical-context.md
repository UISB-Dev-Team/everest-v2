# DormPay v2 — Technical Context

This document specifies verified framework versions, runtime libraries, Next.js 16 conventions, Supabase client configurations, and external service architectures in **DormPay v2 (`everest-v2`)**.

---

## 1. Frameworks and Dependencies (Verified in [`package.json`](../../package.json))

| Package | Version | Verified Role | Authoritative Sources |
| :--- | :--- | :--- | :--- |
| `next` | `16.2.6` | Web framework: App Router, Turbopack default (`dev` and `build`), `proxy.ts`, Server Actions, Route Handlers | `package.json#L17`, `next.config.ts#L1-L10`, `proxy.ts#L1-L20` |
| `react`, `react-dom` | `19.2.4` | UI library: React 19 concurrent features, `useSyncExternalStore` auth state | `package.json#L18-L19`, `features/auth/hooks/useAuth.ts#L1-L15` |
| `typescript` | `^5` | Strict TypeScript compilation (`strict: true`), `@/*` path mapping to `./*` | `package.json#L34`, `tsconfig.json#L1-L30` |
| `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css` | `^4`, `^1.4.0` | Tailwind CSS v4 via PostCSS (`@import "tailwindcss";`) | `package.json#L22`, `package.json#L31`, `app/globals.css#L1-L5` |
| `shadcn`, `@radix-ui/react-*`, `class-variance-authority` | `shadcn ^4.0.8`, Radix `^1.x` | Accessible headless UI components in `components/ui/` | `package.json#L13-L16`, `components/ui/` |
| `lucide-react`, `framer-motion` | `^1.16.0`, `^12.23.12` | Icon library and animation primitives | `package.json#L15`, `package.json#L24` |
| `sonner` | `^2.0.7` | Global `<Toaster />` notification manager | `package.json#L20`, `app/layout.tsx#L32` |
| `zustand` | `^5.0.13` | Global state store for academic periods | `package.json#L25`, `features/academic-periods/store.ts#L1-L25` |
| `@supabase/supabase-js`, `@supabase/ssr` | `^2.105.4`, `^0.10.3` | Supabase PostgreSQL, Auth, and Storage SDKs | `package.json#L21`, `package.json#L23`, `lib/supabase/` |
| `supabase` (devDependency) | `^2.98.2` | Supabase CLI for schema migrations and type generation | `package.json#L33` |
| `nodemailer`, `@types/nodemailer` | `^8.0.8`, `^8.0.1` | SMTP email transport | `package.json#L26`, `package.json#L30`, `lib/email.ts#L1-L60` |
| `eslint`, `eslint-config-next` | `^9`, `16.2.6` | Flat ESLint config with Next.js Core Web Vitals and React 19 compiler rules | `package.json#L28-L29`, `eslint.config.mjs#L1-L20` |

---

## 2. Next.js 16 Architectural Conventions

1. **`proxy.ts` Server Request Proxy**:
   - Next.js 16 uses [`proxy.ts`](../../proxy.ts#L18) exporting `export async function proxy(request: NextRequest)` in place of `middleware.ts`. [Source: `proxy.ts#L18`].
2. **Asynchronous Route `params` & `searchParams`**:
   - In Next.js 16, dynamic route parameters in `page.tsx` and `layout.tsx` are promises and must be awaited (`const { id } = await params;`). [Source: `app/(admin)/admin/events/[id]/page.tsx#L11`].
3. **Route Typegen (`next typegen`)**:
   - `npm run typecheck` invokes `next typegen && tsc --noEmit`. Running `tsc` directly without `next typegen` fails if `.next/types` has not been generated. [Source: `package.json#L8`].

---

## 3. Supabase Client Configurations ([`lib/supabase/`](../../lib/supabase/))

Three distinct Supabase client factories exist:

1. **Browser Client ([`lib/supabase/client.ts`](../../lib/supabase/client.ts))**:
   - Calls `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)` from `@supabase/ssr`. [Source: `lib/supabase/client.ts#L1-L15`].
   - Used in browser-executed modules (`academic-periods`, `auth`, `clearance`, `dormitories`, `events`, `fines`).
2. **Server Cookie Client ([`lib/supabase/server.ts`](../../lib/supabase/server.ts))**:
   - Asynchronous `await createClient()` calling `createServerClient` wired to Next.js 16 `await cookies()`. [Source: `lib/supabase/server.ts#L1-L30`].
   - Used in [`app/auth/callback/route.ts#L11`](../../app/auth/callback/route.ts#L11), [`app/(super-admin)/super-admin/accounts/page.tsx#L12`](../../app/(super-admin)/super-admin/accounts/page.tsx#L12), and [`features/accounts/actions/user-actions.ts#L7`](../../features/accounts/actions/user-actions.ts#L7).
3. **Admin Service-Role Client ([`lib/supabase/admin.ts`](../../lib/supabase/admin.ts))**:
   - Initializes `createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` with `autoRefreshToken: false, persistSession: false`. [Source: `lib/supabase/admin.ts#L1-L20`].
   - **Boundary Constraint**: Must only be imported in server files (`"use server"` or Route Handlers). Used for privileged Auth administration (`auth.admin.*`) and Storage uploads.

---

## 4. Email Transport & CSV Engine

- **Email Dispatcher ([`lib/email.ts`](../../lib/email.ts))**:
  - Next.js Server Action (`"use server"`) invoking `nodemailer.createTransport` with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`. [Source: `lib/email.ts#L11-L25`].
  - Mandates institutional audit logging by setting `cc: "dormpay@vsu.edu.ph"` on all outgoing messages. [Source: `lib/email.ts#L36`].
  - Consumes 14 HTML email string templates under [`emails/`](../../emails/).
- **CSV Engine ([`lib/csv/parse-csv.ts`](../../lib/csv/parse-csv.ts))**:
  - `readCsvBytes(buffer)` inspects initial byte sequences to detect UTF-16LE (`FF FE`), UTF-16BE (`FE FF`), UTF-8 BOM (`EF BB BF`), or falls back to Windows-1252 to preserve extended Latin characters (`ñ`/`Ñ`). [Source: `lib/csv/parse-csv.ts#L20-L55`].
  - `parseCsv(text)` parses RFC 4180 standard CSV including quoted cells, escaped quotes (`""`), and multiline entries. [Source: `lib/csv/parse-csv.ts#L60-L125`].
  - `FORMULA_TRIGGERS = /^[=+\-@\t\r]/` sanitizes imported cells and escapes exported cells to prevent spreadsheet formula injection. [Sources: `features/dormers/lib/import-dormers-csv.ts#L18`, `features/payments/lib/export-payments-csv.ts#L12`].

---

## 5. Styling & Visual Branding

- **Brand Theme ([`app/globals.css`](../../app/globals.css))**:
  - Primary brand color: `--brand: #12372a` (`--brand-hover: #1c4f3d`, `--brand-light: #e8f0ed`, `--brand-muted: #436850`). [Source: `app/globals.css#L10-L15`].
- **Formatting Utilities ([`lib/format.ts`](../../lib/format.ts))**:
  - `formatCurrency(amount)` outputs Philippine Peso amounts prefixed with `₱`. [Source: `lib/format.ts#L6-L12`].
  - `formatDate(dateStr)` formats dates as `MMM d, yyyy` (e.g., `Jan 15, 2026`). [Source: `lib/format.ts#L15-L25`].
