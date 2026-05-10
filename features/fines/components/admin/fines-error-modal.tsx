"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinesErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinesErrorModal({
  isOpen,
  onClose,
}: FinesErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Error</DialogTitle>
        <DialogDescription>
          An existing payment for this fine already exists. You cannot
          override or delete it.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
