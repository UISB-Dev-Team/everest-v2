"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Dormer } from "@/features/dormers/data";

interface DeleteDormerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormer: Dormer | null;
  onConfirm: (dormerId: string) => Promise<void>;
}

export default function DeleteDormerModal({
  isOpen,
  onClose,
  dormer,
  onConfirm,
}: DeleteDormerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!dormer) return;
    setIsDeleting(true);
    try {
      await onConfirm(dormer.id);
      toast.success(
        `Dormer "${dormer.first_name} ${dormer.last_name}" has been deleted.`
      );
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete dormer: ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!dormer) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Are you sure you want to delete this dormer?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            dormer record for{" "}
            <span className="font-semibold text-gray-800">
              {dormer.first_name} {dormer.last_name}
            </span>{" "}
            and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete dormer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
