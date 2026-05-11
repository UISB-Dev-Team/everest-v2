"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface AddEventInput {
  name: string;
  description: string;
  amount_due: number;
  due_date: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AddEventInput) => Promise<void> | void;
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
}: AddEventModalProps) {
  const [name, setName] = useState("");
  const [amountDue, setAmountDue] = useState(0);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAmountDue(0);
      setDescription("");
      setDueDate("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSubmitting(true);
    if (!name || !amountDue || !description || !dueDate) {
      toast.info("All fields are required.");
      setIsSubmitting(false);
      return;
    }
    try {
      await onSave({
        name,
        description,
        amount_due: amountDue,
        due_date: dueDate,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Fill in the details to register a new event
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">
                Event Name{" "}
                <span className="text-xs text-gray-500">
                  ({name.length}/100)
                </span>
              </Label>
              <Input
                id="name"
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="description">
                Description{" "}
                <span className="text-xs text-gray-500">
                  ({description.length}/500)
                </span>
              </Label>
              <Textarea
                id="description"
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amountDue">Event Collectible</Label>
              <Input
                id="amountDue"
                className="mt-1"
                type="number"
                value={amountDue}
                onChange={(e) => setAmountDue(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                className="mt-1"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            className="bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold transition-all"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
