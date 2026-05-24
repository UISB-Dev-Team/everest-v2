import { Event } from "@/features/events/data";


export const eventReminder = (event: Event) => `
    <h1>Payment Reminder</h1>
    <p>Hi dormers,</p>
    <p>This is a friendly reminder that your payment for <strong>${
        event.name
    }</strong> is still pending.</p>
    <p><strong>Amount Due: ₱${event.amount_due}</strong></p>
    <p>Please settle this amount on or before <strong>${
        event.due_date
    }</strong> to avoid any delays.</p>
    <p>You can make your payment to the Dormitory Treasurer or Dormitory Auditor.</p>
    
    <p style="margin-top: 25px;">Best regards,<br><strong>VSU DormPay</strong></p>
    <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; color: #888888; text-align: center; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0;">© ${new Date().getFullYear()} VSU DormPay. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Visca, Baybay City, Leyte</p>
        <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
    </div>
`;