"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

/**
 * Stand-in for modals that have been earmarked for full port from the old
 * repo but aren't wired up yet. Keeps the action buttons functional and the
 * page compiling. Replace with the real modal as it's ported.
 */
export function PlaceholderModal({
  isOpen,
  onClose,
  title,
  description,
}: PlaceholderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ??
              "This modal is earmarked for full port from the old repo. The visual layout will be added in a follow-up batch — the button is wired up to the data-access seam, but the modal UI hasn't been ported yet."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
