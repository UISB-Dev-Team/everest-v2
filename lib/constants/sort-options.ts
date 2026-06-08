import type { FilterOption } from "@/components/ui/shared";

// ─── Common sort option builders ────────────────────────────────────────────

/** Name A→Z / Z→A pair used everywhere a dormer name sort is needed. */
export const NAME_SORT_OPTIONS: FilterOption[] = [
  { value: "name-asc",  label: "Name A→Z" },
  { value: "name-desc", label: "Name Z→A" },
];

/** Payment-date oldest/newest pair. */
export const PAYMENT_DATE_SORT_OPTIONS: FilterOption[] = [
  { value: "payment_date-asc",  label: "Payment Date ↑" },
  { value: "payment_date-desc", label: "Payment Date ↓" },
];

/** Amount-paid low/high pair. */
export const AMOUNT_PAID_SORT_OPTIONS: FilterOption[] = [
  { value: "amount_paid-asc",  label: "Amount Paid ↑" },
  { value: "amount_paid-desc", label: "Amount Paid ↓" },
];

/** Pending-amount low/high pair. */
export const PENDING_AMOUNT_SORT_OPTIONS: FilterOption[] = [
  { value: "pending_amount-asc",  label: "Pending Amount ↑" },
  { value: "pending_amount-desc", label: "Pending Amount ↓" },
];

/** Outstanding-balance low/high pair (clearance). */
export const OUTSTANDING_SORT_OPTIONS: FilterOption[] = [
  { value: "outstanding-asc",  label: "Outstanding ↑" },
  { value: "outstanding-desc", label: "Outstanding ↓" },
];

/** Unpaid-bills count low/high pair (clearance). */
export const UNPAID_BILLS_SORT_OPTIONS: FilterOption[] = [
  { value: "unpaid_bills-asc",  label: "Unpaid Bills ↑" },
  { value: "unpaid_bills-desc", label: "Unpaid Bills ↓" },
];

/** Unpaid-fines count low/high pair (clearance). */
export const UNPAID_FINES_SORT_OPTIONS: FilterOption[] = [
  { value: "unpaid_fines-asc",  label: "Unpaid Fines ↑" },
  { value: "unpaid_fines-desc", label: "Unpaid Fines ↓" },
];

// ─── Pre-composed sort-option arrays for each page ──────────────────────────

/** events/[id] — sort by name or payment date */
export const EVENT_DETAIL_SORT_OPTIONS: FilterOption[] = [
  ...NAME_SORT_OPTIONS,
  ...PAYMENT_DATE_SORT_OPTIONS,
];

/** events (all) — sort by name, amount paid, or pending amount */
export const ALL_EVENTS_SORT_OPTIONS: FilterOption[] = [
  ...NAME_SORT_OPTIONS,
  ...AMOUNT_PAID_SORT_OPTIONS,
  ...PENDING_AMOUNT_SORT_OPTIONS,
];

/** fines/admin — sort by name */
export const FINES_ADMIN_SORT_OPTIONS: FilterOption[] = [
  ...NAME_SORT_OPTIONS,
];

/** clearance — sort by name, unpaid bills, unpaid fines, balance */
export const CLEARANCE_SORT_OPTIONS: FilterOption[] = [
  ...NAME_SORT_OPTIONS,
  ...UNPAID_BILLS_SORT_OPTIONS,
  ...UNPAID_FINES_SORT_OPTIONS,
  ...OUTSTANDING_SORT_OPTIONS,
];

// ─── Common filter option arrays ────────────────────────────────────────────

/** Payment status options shared between event-dormers-table and fines. */
export const PAYMENT_STATUS_OPTIONS: FilterOption[] = [
  { value: "All",     label: "All Statuses" },
  { value: "Paid",    label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Unpaid",  label: "Unpaid" },
  { value: "Waived",  label: "Waived" },
];

/** Cleared / Pending status for all-events payable table. */
export const PAYABLE_STATUS_OPTIONS: FilterOption[] = [
  { value: "All",     label: "All Statuses" },
  { value: "cleared", label: "Cleared" },
  { value: "pending", label: "Has Pending" },
];

/** Clearance status for clearance page. */
export const CLEARANCE_STATUS_OPTIONS: FilterOption[] = [
  { value: "all",         label: "All Statuses" },
  { value: "cleared",     label: "Cleared" },
  { value: "not-cleared", label: "Not Cleared" },
];

/** Fines payment status subset. */
export const FINES_STATUS_OPTIONS: FilterOption[] = [
  { value: "All",    label: "All Statuses" },
  { value: "Unpaid", label: "Unpaid" },
  { value: "Paid",   label: "Paid" },
  { value: "Waived", label: "Waived" },
];

/** Build room filter options from a room-number array. */
export function buildRoomOptions(rooms: string[]): FilterOption[] {
  return [
    { value: "All", label: "All Rooms" },
    ...rooms.map((r) => ({ value: r, label: `Room ${r}` })),
  ];
}
