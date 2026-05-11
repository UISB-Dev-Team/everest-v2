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
import type { Adviser } from "@/features/advisers/data";

interface DeleteAdviserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (roleId: string) => Promise<void> | void;
  adviser: Adviser | null;
}

export default function DeleteAdviserModal({
  isOpen,
  onClose,
  onDelete,
  adviser,
}: DeleteAdviserModalProps) {
  if (!adviser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Remove Adviser
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-600">
            Are you sure you want to remove{" "}
            <span className="font-bold">
              &quot;{adviser.first_name} {adviser.last_name}&quot;
            </span>{" "}
            from the adviser registry? This will mark them as inactive.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-gray-100"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onDelete(adviser.role_id);
              onClose();
            }}
            size="sm"
          >
            Confirm Removal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
