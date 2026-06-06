import { FineImpositionWithCategory } from "../data";


export function listToCSV(list: FineImpositionWithCategory[]) {
  const csvHeader = ["Dormer", "Room", "Fine Type", "Amount", "Amount Paid", "Remaining Balance", "Date Imposed"];
  const csvRows = list.map((f) => [
    f.dormer_full_name,
    f.dormer_room,
    f.category_name,
    f.amount,
    f.amount_paid,
    f.amount - f.amount_paid,
    f.date_imposed,
  ].join(","))
  return csvHeader.join(",") + "\n" + csvRows.join("\n");
}