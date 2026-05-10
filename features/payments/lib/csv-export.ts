import { toast } from "sonner";
import type { BillWithPayments } from "@/features/payments/data";

export const handleExport = (filteredBills: BillWithPayments[]) => {
  if (filteredBills.length === 0) {
    toast.info("No data to export.");
    return;
  }

  const convertToCSV = (data: BillWithPayments[]): string => {
    const headers = [
      "Dormer",
      "Room",
      "Billing Period",
      "Total Due",
      "Amount Paid",
      "Remaining Balance",
      "Status",
      "Payment Dates",
    ];

    const rows = data.map((bill) => {
      const paymentDates = bill.payments
        .map((p) => new Date(p.created_at).toLocaleDateString())
        .join("; ");

      return [
        `"${bill.dormer_full_name}"`,
        `"${bill.dormer_room ?? ""}"`,
        bill.billing_month,
        bill.total_amount_due.toFixed(2),
        (bill.amount_paid || 0).toFixed(2),
        bill.remaining_balance.toFixed(2),
        bill.status,
        `"${paymentDates}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const csvData = convertToCSV(filteredBills);
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `payments-report-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Payments report exported successfully!");
};
