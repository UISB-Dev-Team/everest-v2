"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Bill, paymentsData, type CreatePaymentInput } from "@/features/payments/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { sendEmail } from "@/lib/email";
import { DormerWithBills } from "@/features/dormers/data";
import { billPaymentInvoiceTemplate } from "@/emails/dormers/billPaymentInvoice";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { paymentConfirmationEmailTemplate } from "@/emails/payment/paymentConfirmation";

interface PaymentInput {
  bill_id: string;
  dormer_id: string;
  dormitory_id: string;
  academic_period_id: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
}

export function usePaymentActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selected: selectedPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory();
  const { user } = useAuth();

  const handleRecordPayment = async (input: any, dormer: DormerWithBills) => {
    setIsSubmitting(true);
    try {
      const { newStatus, newRemaining } = await paymentsData.recordPayment(
        input,
        selectedPeriod?.id ?? "",
        dormitoryId ?? "",
        user?.id ?? "",
      );
      toast.success("Payment recorded successfully!");
      await sendEmail({
        to: dormer?.email!,
        subject: `Payment Confirmation - VSU DormPay`,
        html: paymentConfirmationEmailTemplate(
          dormer?.first_name! + " " + dormer?.last_name!,
          getBillingPeriodLabel(input.billing_month),
          newRemaining,
          input.amount_paid,
          newStatus,
        )
      })
      toast.message("Receipt email sent successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayAllBills = async (bills: Bill[], dormer:DormerWithBills) => {
    setIsSubmitting(true);
    try {
      for (const bill of bills) {
        await paymentsData.recordPayment(
          {
            bill_id: bill.id,
            dormer_id: bill.dormer_id,
            dormitory_id: bill.dormitory_id,
            academic_period_id: bill.academic_period_id,
            amount_paid: (bill.total_amount_due - (bill.amount_paid ?? 0)),
            payment_method: "Cash",
            notes: "Paid via Admin",
          },
          selectedPeriod?.id ?? "",
          dormitoryId ?? "",
          user?.id ?? "",
        );
        toast.success("Bills paid successfully!");
        const totalAmountDue = bills.reduce((sum, b) => sum + b.total_amount_due, 0);
        const totalPaid = bills.reduce((sum, b) => sum + b.total_amount_due, 0); // paying all
        const totalRemaining = 0; // since all are being paid
        toast.success("Bills generated successfully");
        await sendEmail({
            to: dormer?.email!,
            subject: `Bulk Payment Confirmation - VSU DormPay`,
            html: billPaymentInvoiceTemplate(
                dormer?.first_name! + " " + dormer?.last_name!,
                bills.map((bill) => ({
                    billingPeriod: getBillingPeriodLabel(bill.billing_month),
                    description: bill.description,
                    totalAmountDue: bill.total_amount_due,
                    amountPaid: bill.total_amount_due, // fully paid
                    remainingBalance: 0,
                    paymentDate: new Date(),
                })),
                `${user?.fullName}`,
                {
                totalBills: bills.length,
                totalAmountDue,
                totalPaid,
                totalRemaining,
                }
            ),
            });
          toast.success("Payment confirmation email sent.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to pay bills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleRecordPayment, handlePayAllBills, isSubmitting };
}
