import { FineImpositionWithCategory } from "../data";

function csvCell(value: unknown) {
  const raw = String(value ?? "");
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function listToCSV(list: FineImpositionWithCategory[]) {
  const header = [
     "Dormer",
     "Room",
     "Fine Type",
     "Amount",
     "Amount Paid",
     "Remaining Balance",
     "Date Imposed",
   ]
     .map(csvCell)
     .join(",");
   const rows = list.map((f) => {
     const paid = f.amount_paid ?? 0;
     return [
       f.dormer_full_name,
       f.dormer_room ?? "",
       f.category_name,
       f.amount,
       paid,
       f.amount - paid,
       f.date_imposed,
     ]
       .map(csvCell)
       .join(",");
   });
   return `${header}\n${rows.join("\n")}`;
}