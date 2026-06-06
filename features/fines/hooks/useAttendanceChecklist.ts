"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AttendanceSubmitPayload } from "../components/admin/attendance-checklist-modal";
import { FineCategory } from "../data";
import { Dormer } from "@/features/dormers/data";
import { CreateFineImpositionInput } from "../data";
import { sendEmail } from "@/lib/email";
import { newFineImposedTemplate } from "@/emails/fines/newFineImposed";

interface UseAttendanceChecklistOptions {
  /** Your existing imposeFine action from useFinesActions */
  imposeFine: (input: CreateFineImpositionInput) => Promise<void>;
  academicPeriodId: string;
  dormitoryId: string;
  dormers: Dormer[];
  payableFines: FineCategory[];
}

interface AttendanceResult {
  successCount: number;
  errorCount: number;
  errors: string[];
}

export function useAttendanceChecklist({
  imposeFine,
  academicPeriodId,
  dormitoryId,
  dormers,
  payableFines,
}: UseAttendanceChecklistOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);

  /**
   * Called by AttendanceChecklistModal when the SA confirms.
   * Loops through absent dormers and calls imposeFine for each one,
   * mirroring exactly what your existing handleGenerateFine does.
   */
  const handleAttendanceSubmit = async (payload: AttendanceSubmitPayload) => {
    const { date, fineId, absentDormerIds } = payload;

    const fine = payableFines.find((f) => f.id === fineId);
    if (!fine) {
      toast.error("Selected fine type not found.");
      return;
    }

    if (absentDormerIds.length === 0) {
      toast.info("No absent dormers to generate fines for.");
      return;
    }

    setIsSubmitting(true);
    const errors: string[] = [];
    let successCount = 0;

    for (const dormerId of absentDormerIds) {
      const dormer = dormers.find((d) => d.id === dormerId);
      if (!dormer) {
        errors.push(`Dormer ${dormerId}: not found in current list.`);
        continue;
      }

      try {
        const input: CreateFineImpositionInput = {
          fine_id: fineId,
          academic_period_id: academicPeriodId,
          dormer_id: dormerId,
          dormitory_id: dormitoryId,
          amount: fine.amount,
          date_imposed: date,
          remarks: `Absent — ${fine.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // dormitory_enrollment_id is required by your type — pull from dormer
          dormitory_enrollment_id: dormer.dormer_enrollment_id,
          notes: fine.name,
        };

        await imposeFine(input);

        // Mirror the email pattern from your existing handleGenerateFine
        await sendEmail({
          to: dormer.email,
          subject: "Fine Imposed",
          html: newFineImposedTemplate(dormer.first_name, [
            {
              finesRemarks: input.remarks ?? "Absent",
              totalAmountDue: fine.amount,
              dateImposed: new Date(date),
            },
          ]),
        });

        successCount++;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error";
        errors.push(`${dormer.first_name} ${dormer.last_name}: ${msg}`);
      }
    }

    setIsSubmitting(false);

    const result: AttendanceResult = {
      successCount,
      errorCount: errors.length,
      errors,
    };
    setResult(result);

    if (errors.length === 0) {
      toast.success(
        `${successCount} fine${successCount !== 1 ? "s" : ""} generated successfully.`
      );
    } else if (successCount > 0) {
      toast.warning(
        `${successCount} fine${successCount !== 1 ? "s" : ""} generated, ${errors.length} failed.`
      );
    } else {
      toast.error("All fine generations failed. Check errors for details.");
    }
  };

  const clearResult = () => setResult(null);

  return {
    handleAttendanceSubmit,
    isSubmitting,
    result,
    clearResult,
  };
}