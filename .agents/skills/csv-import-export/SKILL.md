---
name: csv-import-export
description: Guides the implementation of RFC 4180 CSV imports, batch database writes, progress modals, concurrent email workers, and formula-injection-safe CSV exports in DormPay v2. Use when adding or modifying CSV upload/download workflows across dormers, fines, payments, or expenses.
---

# CSV Import and Export Skill

Use this skill whenever adding or modifying CSV file imports or CSV report exports in DormPay v2.

## 1. Required Pre-Implementation Context

1. [`lib/csv/parse-csv.ts`](../../../lib/csv/parse-csv.ts) — Core byte-sniffing decoder (`readCsvBytes`) and RFC 4180 state-machine parser (`parseCsv`).
2. Reference CSV Import Implementations:
   - Dormers: [`features/dormers/lib/import-dormers-csv.ts`](../../../features/dormers/lib/import-dormers-csv.ts) and [`features/dormers/data/supabase.ts`](../../../features/dormers/data/supabase.ts) (`importCsv`).
   - Fines: [`features/fines/utils/csv-Rules.ts`](../../../features/fines/utils/csv-Rules.ts).
3. Reference CSV Export Implementations:
   - Payments: [`features/payments/lib/export-payments-csv.ts`](../../../features/payments/lib/export-payments-csv.ts).
   - Expenses: [`features/expenses/lib/export-expenses-csv.ts`](../../../features/expenses/lib/export-expenses-csv.ts).
4. Shared Progress UI: [`components/ui/shared/progress-modal.tsx`](../../../components/ui/shared/progress-modal.tsx).

---

## 2. CSV Import Workflow

### Step 1: Decode and Parse Using `lib/csv/parse-csv.ts`
Never use `file.text()` + naive `.split("\n").map(line => line.split(","))`. Excel on Windows frequently saves CSVs in Windows-1252 or UTF-16 with BOM and wraps fields containing commas in quotes.

Always decode from `await file.arrayBuffer()`:
```ts
import { readCsvBytes, parseCsv } from "@/lib/csv/parse-csv";

const buffer = await file.arrayBuffer();
const text = readCsvBytes(buffer);
const rows = parseCsv(text);
```

### Step 2: Sanitize Spreadsheet Formula Triggers
Sanitize every imported string field against spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`):
```ts
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;
function sanitizeCell(value: string): string {
  const trimmed = value.trim();
  return FORMULA_TRIGGERS.test(trimmed) ? trimmed.replace(/^[=+\-@\t\r]+/, "") : trimmed;
}
```

### Step 3: Validate Rows & Deduplicate Before Database Calls
- Validate required columns, email format, numeric bounds, and allowed enum/room values up front.
- Return structured row-level validation errors (`rowNumber`, `message`) so the UI can display exact failure reasons.
- Deduplicate identifiers (e.g., lowercase emails) within the CSV batch before hitting Supabase.

### Step 4: Batch Database Queries & Concurrent Email Queue
- Avoid sequential per-row `SELECT` queries. Prefetch existing records in a single `.in(...)` batch query, and use bulk `.upsert(...)` / `.insert(...)` where possible.
- Show progress to the user via [`ProgressModal`](../../../components/ui/shared/progress-modal.tsx).
- When sending welcome or notification emails for a batch import, use a bounded concurrency worker pool (e.g., `CONCURRENCY = 5` workers as in `features/dormers/data/supabase.ts`) rather than awaiting each SMTP call sequentially or firing 200 unbounded promises simultaneously.

---

## 3. CSV Export Workflow

### Step 1: Escape Cells & Prevent Formula Injection (`csvSafe`)
Every exported cell must neutralize leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) by prefixing with a single quote `'`, and wrap values containing `,`, `"`, `\n`, or `\r` in double quotes with doubled internal quotes (`""`):

```ts
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

function csvSafe(raw: string | number | null | undefined): string {
  const value = String(raw ?? "");
  const neutralized = FORMULA_TRIGGERS.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}
```

### Step 2: Prepend UTF-8 BOM (`\uFEFF`) for Excel Compatibility
Always prepend `\uFEFF` to the CSV string so Microsoft Excel opens UTF-8 characters (such as `₱` and `ñ`/`Ñ`) with proper encoding:
```ts
const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
```

---

## 4. Verification Checklist

1. Test/verify with CSV rows containing commas inside quotes, escaped quotes (`""`), `ñ`/`Ñ` characters, and leading `=`/`+`/`-`/`@` characters.
2. Run `npm run typecheck` and `npx eslint <modified-files>`.
