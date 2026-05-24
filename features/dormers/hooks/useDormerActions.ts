"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dormersData } from "@/features/dormers/data";
import { paymentsData } from "@/features/payments/data";
import type {
  CreateDormerInput,
  Dormer,
  DormerWithBills,
  UpdateDormerInput,
} from "@/features/dormers/data";
import type { Bill, CreatePaymentInput } from "@/features/payments/data";
import { useAcademicPeriod } from "@/lib/hooks/useAcademicPeriod";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { sendEmail } from "@/lib/email";
import { newBillTemplate } from "@/emails/dormers/newBill";
import { billPaymentInvoiceTemplate } from "@/emails/dormers/billPaymentInvoice";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { welcomeAdviser } from "@/emails/dormers/welcomeAdviser";
import { welcomeSA } from "@/emails/dormers/welcomeSA";
import { welcomeUser } from "@/emails/dormers/welcomeUser";

interface PaymentInput {
  bill_id: string;
  dormer_id: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
  academic_period_id: string;
  dormitory_id: string;
}

/**
 * Mirrors the surface of the old `useDormerActions` hook but routes every
 * mutation through the data-access seam. Email-sending is mocked with a toast
 * so flows feel complete; backend dev wires real `sendEmail()` later.
 */
export function useDormerActions(_dormers: Dormer[], _bills: Bill[], setDormers: React.Dispatch<React.SetStateAction<DormerWithBills[]>>, setBills: React.Dispatch<React.SetStateAction<Bill[]>>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useAuth();
  const {dormitoryName} = useDormitory()

  const saveDormer = async (input: CreateDormerInput) => {
    setIsSubmitting(true);
    try {
      const exists = _dormers.some((d) => d.email === input.email);
      if (exists) {
        toast.error("A dormer with this email already exists.");
        return;
      }
      const newProfile = await dormersData.create(input);
      setDormers((prev) => [
        ...prev,
        {
          ...newProfile,
          dormitory_id: input.dormitory_id ?? null,
          room_number: input.room_number ?? null,
          status: "active",
          bills: []
        }
      ])
      toast.success("Dormer added successfully!");
      
      if(input.role == "adviser") {
        await sendEmail({
          to: input?.email!,
          subject: "Adviser - Dormpay Invitation",
          html: welcomeAdviser(
            input.first_name,
            input?.email!,
            "DefaultPass123!",
            dormitoryName!,
          )
        })
      }
      else if(input.role == "sa") {
          await sendEmail({
            to: input?.email!,
            subject: "Student Assistant - Dormpay Invitation",
            html: welcomeSA(
              input.first_name,
              input?.email!,
              "DefaultPass123!",
            )
          })
        }
      else if(input.role == "treasurer" || input.role == "auditor") {
        await sendEmail({
            to: input?.email!,
            subject: "Treasurer and Auditor - Dormpay Invitation",
            html: welcomeSA(
              input.first_name,
              input?.email!,
              "DefaultPass123!",
            )
          })
        }
        else {
          await sendEmail({
            to: input?.email!,
            subject: "Dormer - Dormpay Invitation",
            html: welcomeUser(
              input.first_name,
              input?.email!,
              "DefaultPass123!",
            )
          })
        }
      toast.message(`Account invitation sent to ${input.email}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDormer = async (id: string, input: UpdateDormerInput) => {
    setIsSubmitting(true);
    try {
      await dormersData.update(id, input);
      setDormers((prev) => 
        prev.map((dormer) => 
          dormer.id === id ? { 
            ...dormer, 
            ...input, 
            dormitory_id: input.dormitory_id ?? dormer.dormitory_id,
            room_number: input.room_number ?? dormer.room_number,
            status: input.is_active ? "active" : "inactive",
          } : dormer
        )
      )
      toast.success("Dormer updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDormer = async (dormerId: string) => {
    setIsSubmitting(true);
    try {
      await dormersData.remove(dormerId);
      setDormers((prev) => prev.filter((dormer) => dormer.id !== dormerId))
      setBills((prev) => prev.filter((bill) => bill.dormer_id !== dormerId))
      toast.success("Dormer deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePayment = async (paymentInput: any, academicPeriod: any, dormitoryId: any, user: any) => {
    setIsSubmitting(true);
    try {
      
      await paymentsData.recordPayment(paymentInput.bill_id, academicPeriod?.id!, dormitoryId, user?.id);
      setBills((prev) =>
        prev.map((b) => {
          if (b.id !== paymentInput.bill_id) return b;
          const newAmountPaid = b.amount_paid + paymentInput.amount;
          const remaining = b.total_amount_due - newAmountPaid;
          return {
            ...b,
            amount_paid: newAmountPaid,
            status:
              remaining <= 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid",
          };
        })
      )
      toast.success("Payment recorded successfully!");
      toast.message("(Receipt email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveBill = async (
    billInput: {
      dormer_id: string;
      dormitory_id: string;
      academic_period_id: string;
      billing_month: string;
      description: string;
      total_amount_due: number;
      regular_charge_id?: string | null;
      due_date?: string | null;
    }
  ) => {
    setIsSubmitting(true);
    try {
      const dormer = await dormersData.getById(billInput.dormer_id);
      const newBill = await paymentsData.createBill({
        ...billInput,
        amount_paid: 0,
        status: "Unpaid",
        created_by: user?.id ?? null,
      });
      setBills((prev) => [...prev, newBill])
      toast.success("Bill generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const payAllBills = async (unpaidBills: Bill[], academicPeriod: any, dormitoryId: any, dormer: any) => {
    setIsSubmitting(true);
    try {
      for (const bill of unpaidBills) {
        const remaining = Math.max(0, bill.total_amount_due - bill.amount_paid);
        if (remaining <= 0) continue;
        await paymentsData.recordPayment(bill.id, academicPeriod?.id!, dormitoryId!, dormer?.id!);
      }

      setBills((prev) =>
        prev.map((b) =>
          unpaidBills.some((u) => u.id === b.id)
            ? { ...b, amount_paid: b.total_amount_due, status: "Paid" }
            : b
        )
      );
      toast.success("All bills marked as paid!");

      const totalAmountDue = unpaidBills.reduce((sum, b) => sum + b.total_amount_due, 0);
      const totalPaid = unpaidBills.reduce((sum, b) => sum + b.total_amount_due, 0); // paying all
      const totalRemaining = 0; // since all are being paid

      await sendEmail({
        to: dormer?.email!,
        subject: `Bulk Payment Confirmation - VSU DormPay`,
        html: billPaymentInvoiceTemplate(
          dormer?.fullName!,
          unpaidBills.map((bill) => ({
            billingPeriod: getBillingPeriodLabel(bill.billing_month),
            description: bill.description,
            totalAmountDue: bill.total_amount_due,
            amountPaid: bill.total_amount_due, // fully paid
            remainingBalance: 0,
            paymentDate: new Date(),
          })),
          `${dormer?.fullName}`,
          {
            totalBills: unpaidBills.length,
            totalAmountDue,
            totalPaid,
            totalRemaining,
          }
        ),
      });
      toast.success("Payment confirmation email sent.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to pay all bills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const importDormers = async (rows: CreateDormerInput[]) => {
    setIsSubmitting(true);
    setErrors([]);
    const errorList: string[] = [];
    const created: DormerWithBills[] = []
    try {
      for (const row of rows) {
        if (_dormers.some((d) => d.email === row.email)) {
          errorList.push(`Dormer with email ${row.email} already exists.`);
          continue;
        }
        const newProfile = await dormersData.create(row);
        created.push({
          ...newProfile,
          dormitory_id: row.dormitory_id ?? null,
          room_number: row.room_number ?? null,
          status: "active",
          bills: [],
        });
        await sendEmail({
          to: row?.email!,
          subject: "Dormer - Dormpay Invitation",
          html: welcomeUser(
            row.first_name,
            row?.email!,
            "DefaultPass123!",
          )
        })
      }
      if (created.length) setDormers((prev) => [...prev, ...created]);
      setErrors(errorList);
      if (errorList.length === 0) {
        toast.success(`Imported ${rows.length} dormer(s) successfully! Activation email has been sent.`);
      } else {
        toast.warning(
          `Imported with ${errorList.length} skipped row(s). See dialog for details.`
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveDormer,
    updateDormer,
    deleteDormer,
    handleSavePayment,
    saveBill,
    payAllBills,
    importDormers,
    isSubmitting,
    errors,
  };
}
