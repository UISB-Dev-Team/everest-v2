"use client";

import { useMemo } from "react";
import type { Bill } from "@/features/payments/data";
import type { RegularCharge } from "@/features/regular-charges/data";

/**
 * Returns the dynamic bill description (from regular_charges) when available,
 * otherwise falls back to the bill's static description.
 */
export function useBillDescription(
  bill: Bill,
  charges: RegularCharge[]
): string {
  return useMemo(
    () => getBillDescription(bill, charges),
    [bill.regular_charge_id, bill.description, charges]
  );
}

export function getBillDescription(
  bill: Bill,
  charges: RegularCharge[]
): string {
  if (bill.regular_charge_id && charges.length > 0) {
    const charge = charges.find((c) => c.id === bill.regular_charge_id);
    if (charge) return charge.name;
  }
  return bill.description || "N/A";
}
