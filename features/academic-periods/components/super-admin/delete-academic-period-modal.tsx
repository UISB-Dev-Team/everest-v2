"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AcademicPeriod } from "@/features/academic-periods/data";

interface DeleteAcademicPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void> | void;
  period: AcademicPeriod | null;
}

export default function DeleteAcademicPeriodModal({
  isOpen,
  onClose,
  onDelete,
  period,
}: DeleteAcademicPeriodModalProps) {
  if (!period) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] border-neutral-200">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold text-neutral-900">
            Remove Academic Period
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-[15px] text-neutral-600">
            Are you sure you want to remove the{" "}
            <span className="font-semibold text-neutral-900">
              {period.semester === "1st"
                ? "1st Semester"
                : period.semester === "2nd"
                ? "2nd Semester"
                : period.semester}{" "}
              ({period.academic_year})
            </span>
            ? This will hide the period from the active registry and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onDelete(period.id);
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
