import { toast } from "sonner";
import { Dormer } from "@/features/dormers/data";
import { ExpenseWithRecorder } from "@/features/expenses/data";
import { sendEmail } from "@/lib/email";

const convertToCSV = (data: ExpenseWithRecorder[]): string => {
  if (!data || data.length === 0) return "";
  const header = [
    "ID", "Title", "Description", "Amount",
    "Category", "Receipt URL", "Expense Date", "Recorded By",
  ];
  const rows = data.map((expense) =>
    [
      expense.id,
      `"${expense.title.replace(/"/g, '""')}"`,
      `"${expense.description!.replace(/"/g, '""')}"`,
      expense.amount,
      expense.category,
      expense.receipt_image_url || "N/A",
      expense.created_at,
      `"${expense.recordedByFullName}"`,
    ].join(",")
  );
  const total = data.reduce((sum, expense) => sum + expense.amount, 0);
  rows.push(["Total Expenses", "", "", total, "", "", "", ""].join(","));
  return [header.join(","), ...rows].join("\n");
};

export const handleSendExpenseReport = async (
  filteredExpenses: ExpenseWithRecorder[],
  dormers: Dormer[],
  setIsSendingEmail: (isSending: boolean) => void,
  dormitoryName: string
) => {
  if (!dormers || dormers.length === 0) {
    toast.error("No dormer emails available to send the report to.");
    return;
  }
  if (filteredExpenses.length === 0) {
    toast.info("No expense data to send.");
    return;
  }

  setIsSendingEmail(true);
  toast.info("Sending expense report...");

  try {
    const recipientEmails = dormers.map((d) => d.email).filter(Boolean);
    const csvData = convertToCSV(filteredExpenses);

    const emailHtml = `
      <h1>${dormitoryName}'s Expense Report</h1>
      <p>Hello everyone,</p>
      <p>Please find the latest expense report attached to this email.</p>
      <p style="margin-top: 25px;">Best regards,<br><strong>VSU DormPay</strong></p>
      <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; color: #888888; text-align: center; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0;">© ${new Date().getFullYear()} VSU DormPay. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Visca, Baybay City, Leyte</p>
        <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const result = await sendEmail({
      to: recipientEmails.join(", "),
      subject: `${dormitoryName}'s Expense Report`,
      html: emailHtml,
      attachments: [
        {
          filename: `expenses-report-${new Date().toISOString().split("T")[0]}.csv`,
          content: csvData,
          contentType: "text/csv",
        },
      ],
    });

    if (!result.success) throw new Error("Email failed");

    toast.success("Expense report has been emailed to all dormers!");
  } catch (error) {
    console.error("Failed to email report:", error);
    toast.error("There was a problem sending the email report.");
  } finally {
    setIsSendingEmail(false);
  }
};