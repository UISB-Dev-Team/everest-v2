import { Bill } from "@/features/payments/data";

export const paymentConfirmationEmailTemplate = (
  dormerName: string,
  billingMonth: string, 
  remainingBalance: number,
  amountPaid: number,
  status: string
): string => {
  return `<h1>Payment Received!</h1>
            <p>Hi ${dormerName},</p>
            <p>We've received your payment of <strong>₱${amountPaid?.toFixed(
              2
            )}</strong>.</p>
            <p>This payment has been applied to your bill for <strong>${
              billingMonth
            }</strong>.</p>
            ${
              status === "Paid"
                ? `<p>Your bill is now fully paid. Thank you for settling your account!</p>`
                : `
            <p>Your updated remaining balance is: <strong>₱${(
              remainingBalance
            ).toFixed(2)}</strong>.</p>`
            }
            <p>Thank you!</p>
            <p style="margin-top: 25px;">Best regards,<br><strong>VSU DormPay</strong></p>
            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; color: #888888; text-align: center; font-size: 12px; line-height: 1.5;">
                <p style="margin: 0;">© ${new Date().getFullYear()} VSU DormPay. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">Visca, Baybay City, Leyte</p>
                <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
            </div>`;
};