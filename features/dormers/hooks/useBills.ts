import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Bill, CreateBillInput } from "@/features/payments/data";
import {
  createBill,
  findExistingBill,
  findExistingBillsBatch,
  createBillsBatch,
} from "@/features/payments/data/supabase";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { toast } from "sonner";
import { deleteBillData, getDormerByEmail, getProfilesByEmails } from "../data/supabase";
import { sendEmail } from "@/lib/email";
import { Dormer, dormersData, DormerWithBills, ImportedBill } from "../data";
import { newBillTemplate } from "@/emails/dormers/newBill";
import { billPaymentInvoiceTemplate } from "@/emails/dormers/billPaymentInvoice";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { RegularCharge } from "@/features/regular-charges/data";
import { Trash } from "lucide-react";

export function useBills() {
  const { selected: selectedPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory();
  const { user } = useAuth();
  const mapBillInput = (billData: any) => {
    return {
      academic_period_id: selectedPeriod?.id,
      billing_month: billData.billingPeriod,
      created_at: new Date().toISOString(),
      created_by: user?.id,
      description: billData.description,
      dormer_id: billData.dormerId,
      dormitory_id: dormitoryId,
      regular_charge_id: billData.payableId,
      status: billData.status,
      total_amount_due: billData.totalAmountDue,
      updated_at: new Date().toISOString(),
      is_deleted: false,
    } as CreateBillInput;
  };

  const generateBill = async (billData: any, dormer: DormerWithBills) => {
    const toastId = toast.loading("Generating bill...");
    try {
      const mappedInput = mapBillInput(billData) as CreateBillInput;
      const result = await createBill(mappedInput);
      toast.loading("Bill generated! Sending email notification...", {
        id: toastId,
      });

      await sendEmail({
        to: dormer?.email!,
        subject: `New Bill for ${billData.billingPeriod}`,
        html: newBillTemplate(
          dormer?.first_name!,
          billData.billingPeriod,
          billData.totalAmountDue,
        ),
      });
      toast.success("Bill generated successfully and email sent!", {
        id: toastId,
      });
      return result;
    } catch (error) {
      toast.error("Failed to generate bill", { id: toastId });
    }
  };

  const generateBillsBulk = async (
    billsData: any[],
    dormer: DormerWithBills,
  ) => {
    try {
      const bills: Bill[] = [];
      for (const billData of billsData) {
        const result = await generateBill(billData, dormer);
        if (result) {
          bills.push(result as Bill);
        }
      }

      return bills;
    } catch (error) {
      toast.error("Failed to generate bills");
    }
  };

  const deleteBill = async (billId: string) => {
    const toastId = toast.loading("Deleting bill...");
    try {
      await deleteBillData(billId);
      toast.success("Bill deleted successfully", {
        id: toastId,
        style: {
          backgroundColor: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
      });
    } catch (error) {
      toast.error("Failed to delete bill", { id: toastId });
    }
  };

  const importBills = async (
    billsData: ImportedBill[],
    payable: RegularCharge,
    onProgress?: (phase: string, progress?: number, total?: number) => void
  ): Promise<{
    successCount: number;
    errorCount: number;
    errors: string[];
    createdBills: Bill[];
  }> => {
    try {
      // Parsing errors forwarded from the modal before this is called
      const parsingErrors = billsData.filter((b) => b.error).map((b) => b.error!);
      if (parsingErrors.length > 0) {
        return { successCount: 0, errorCount: parsingErrors.length, errors: parsingErrors, createdBills: [] };
      }

      const errors: string[] = [];
      let errorCount = 0;

      // ── Phase 1: Batch email → profile lookup (1 query instead of N) ─────
      onProgress?.("Checking dormers");
      const uniqueEmails = [...new Set(billsData.map((b) => b.email.toLowerCase().trim()))];
      const profiles = await getProfilesByEmails(uniqueEmails);
      const profileMap = new Map(profiles.map((p) => [p.email!.toLowerCase(), p]));

      const validBills: ImportedBill[] = [];
      for (const bill of billsData) {
        if (!profileMap.has(bill.email.toLowerCase().trim())) {
          errorCount++;
          errors.push(`Row ${bill.rowNumber}: No dormer found for email "${bill.email}".`);
        } else {
          validBills.push(bill);
        }
      }

      if (validBills.length === 0) {
        return { successCount: 0, errorCount, errors, createdBills: [] };
      }

      // ── Phase 2: Batch duplicate + paid-bill check (1 query instead of N) ─
      onProgress?.("Checking for duplicates");
      const dormerIds = [
        ...new Set(validBills.map((b) => profileMap.get(b.email.toLowerCase().trim())!.id)),
      ];
      const existingBillRows = await findExistingBillsBatch(dormerIds, payable.id);
      // "dormerId|billingMonth" → { id, status }
      const existingMap = new Map(
        existingBillRows.map((b) => [
          `${b.dormer_id}|${b.billing_month}`,
          { id: b.id, status: b.status },
        ])
      );

      // ── Phase 3: Build insert list — skip duplicates and paid bills ────────
      const billsToInsert: CreateBillInput[] = [];
      for (const bill of validBills) {
        const profile = profileMap.get(bill.email.toLowerCase().trim())!;
        const existing = existingMap.get(`${profile.id}|${bill.billing_month}`);
        if (existing) {
          errorCount++;
          const statusLabel = existing.status.toLowerCase();
          if (statusLabel === "paid" || statusLabel === "partial") {
            errors.push(
              `Row ${bill.rowNumber}: Bill for ${bill.email} (${bill.billing_month}) is already ${statusLabel} and cannot be overwritten.`
            );
          } else {
            errors.push(
              `Row ${bill.rowNumber}: Bill already exists for ${bill.email} in ${bill.billing_month}.`
            );
          }
          continue;
        }
        billsToInsert.push(
          mapBillInput({
            dormerId: profile.id,
            billingPeriod: bill.billing_month,
            status: "Unpaid",
            totalAmountDue: payable.amount,
            payableId: payable.id,
            description: payable.description,
          }) as CreateBillInput
        );
      }

      // ── Phase 4: Single batch insert for all valid bills ──────────────────
      onProgress?.("Creating bills");
      const createdBills = await createBillsBatch(billsToInsert);
      const successCount = createdBills.length;

      // ── Phase 5: Fan-out emails, 5 concurrent workers ────────────────────
      if (createdBills.length > 0) {
        const EMAIL_CONCURRENCY = 5;
        let done = 0;
        let nextIndex = 0;
        let emailsFailed = 0;
        const idToProfile = new Map(profiles.map((p) => [p.id, p]));

        onProgress?.("Sending notifications", 0, createdBills.length);

        const worker = async () => {
          while (true) {
            const i = nextIndex++;
            if (i >= createdBills.length) break;
            const bill = createdBills[i];
            const profile = idToProfile.get(bill.dormer_id);
            try {
              if (profile?.email) {
                await sendEmail({
                  to: profile.email,
                  subject: `New Bill for ${bill.billing_month}`,
                  html: newBillTemplate(profile.first_name ?? "", bill.billing_month, payable.amount),
                });
              }
            } catch {
              emailsFailed++;
            } finally {
              done++;
              onProgress?.("Sending notifications", done, createdBills.length);
            }
          }
        };

        await Promise.all(
          Array.from({ length: Math.min(EMAIL_CONCURRENCY, createdBills.length) }, () => worker())
        );

        if (emailsFailed > 0) {
          toast.warning(
            `${successCount} bill(s) created. ${createdBills.length - emailsFailed} of ${createdBills.length} notification(s) sent.`
          );
        } else {
          toast.success(`${successCount} bill(s) created and notifications sent.`);
        }
      } else if (errorCount > 0) {
        toast.warning(`Import complete. ${errorCount} error(s) — no bills created.`);
      }

      return { successCount, errorCount, errors, createdBills };
    } catch (error) {
      console.error("Failed to import bills:", error);
      toast.error("An unexpected error occurred while importing bills.");
      return { successCount: 0, errorCount: 0, errors: [], createdBills: [] };
    }
  };

  return {
    generateBill,
    generateBillsBulk,
    deleteBill,
    importBills,
  };
}
