export const newEvent = (
  eventName: string,
  amountDue: number,
  dueDate: string
) => `
  <h1>New Event Created</h1>
  <p>Hi dormers,</p>
  <p>A new event, <strong>${eventName}</strong>, has been created.</p>
  <p>Amount Due: <strong>₱${amountDue.toFixed(2)}</strong></p>
  <p>Please pay this amount on or before <strong>${dueDate}</strong> to the Dormitory Treasurer or Auditor.</p>
  <p style="margin-top: 25px;">Best regards,<br><strong>VSU DormPay</strong></p>
  <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; color: #888888; text-align: center; font-size: 12px; line-height: 1.5;">
      <p style="margin: 0;">© ${new Date().getFullYear()} VSU DormPay. All rights reserved.</p>
      <p style="margin: 5px 0 0 0;">Visca, Baybay City, Leyte</p>
      <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
  </div>
`;