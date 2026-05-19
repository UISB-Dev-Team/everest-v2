"use client";

import { useState } from "react";
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

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface UseConfirmDialogReturn {
  ConfirmDialog: React.FC;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: "",
    description: "",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "default",
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = (opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions({
      ...opts,
      confirmText: opts.confirmText || "Continue",
      cancelText: opts.cancelText || "Cancel",
      variant: opts.variant || "default",
    });
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setOpen(false);
  };

  const ConfirmDialog: React.FC = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className={undefined}>
        <AlertDialogHeader className={undefined}>
          <AlertDialogTitle className={undefined}>{options.title}</AlertDialogTitle>
          <AlertDialogDescription className={undefined}>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={undefined}>
          <AlertDialogCancel onClick={handleCancel} className={undefined}>
            {options.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              options.variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
            }
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { ConfirmDialog, confirm };
}