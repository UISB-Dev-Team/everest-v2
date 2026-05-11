import { toast } from "sonner";
import type { ExpenseWithRecorder } from "@/features/expenses/data";

export const handleExport = (expenses: ExpenseWithRecorder[]) => {
  if (expenses.length === 0) {
    toast.info("No data to export.");
    return;
  }

  const headers = [
    "Title",
    "Description",
    "Amount",
    "Category",
    "Expense Date",
    "Recorded By",
  ];

  const rows = expenses.map((e) =>
    [
      `"${e.title}"`,
      `"${e.description ?? ""}"`,
      e.amount.toFixed(2),
      e.category ?? "Other",
      e.expense_date,
      `"${e.recorded_by_full_name ?? ""}"`,
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `expenses-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Expenses exported successfully!");
};
