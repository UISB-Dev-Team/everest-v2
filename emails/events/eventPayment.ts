import { CreateEventPaymentInput, Event, EventPayment } from "@/features/events/data"
import { Payment } from "@/features/payments/data"

export const eventPayment = (existingPaymentId: boolean, firstName: string, event: Event, amount: number, status: "Paid" | "Waived") => {

  return (`
    <h1>Event Payment ${existingPaymentId ? "Updated" : "Recorded"}</h1>
        <p>Hi ${firstName},</p>
        <p>Your payment for the event <strong>${event.name}</strong> has been ${
            existingPaymentId ? "updated" : "recorded"
          }.</p>
        <p>Amount ${
          existingPaymentId ? "Added" : "Paid"
        }: <strong>₱${event.amount_due?.toFixed(2)}</strong></p>
        <p>Total Amount Paid: <strong>₱${amount?.toFixed(
          2
        )}</strong></p>
        <p>Remaining Balance: <strong>₱${(
          event.amount_due! - amount!
        ).toFixed(2)}</strong></p>
        <p>Status: <strong>${status}</strong></p>

        <p style="margin-top: 25px;">Best regards,<br><strong>VSU DormPay</strong></p>
        <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; color: #888888; text-align: center; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;">© ${new Date().getFullYear()} VSU DormPay. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Visca, Baybay City, Leyte</p>
          <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
        </div>
  `)
}