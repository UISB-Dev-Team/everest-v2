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
import type { FineCategory } from "@/features/fines/data";

interface AddFineCategoryModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (category: {
    id?: string;
    name: string;
    amount: number;
    description: string;
  }) => Promise<void> | void;
  category: FineCategory | null;
}

export default function AddFineCategoryModal({
  isOpen,
  isSaving,
  onClose,
  onSave,
  category,
}: AddFineCategoryModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = Boolean(category);

  useEffect(() => {
    if (isOpen && isEditing && category) {
      setName(category.name || "");
      setAmount(String(category.amount) || "");
      setDescription(category.description || "");
    } else if (isOpen) {
      setName("");
      setAmount("");
      setDescription("");
    }
  }, [isOpen, category, isEditing]);

  const handleSave = async () => {
    if (!name || !amount) {
      toast.info("Name and Amount are required.");
      return;
    }
    await onSave({
      ...(isEditing && category ? { id: category.id } : {}),
      name,
      amount: parseFloat(amount),
      description,
    });
    onClose();
  };

  const handleClose = () => {
    setName("");
    setAmount("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Fine" : "Add New Fine"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this fine category."
              : "Fill in the details to add a new fine category."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fine-name" className="text-right">
              Name{" "}
              <span className="text-xs text-gray-500">
                ({name.length}/100)
              </span>
            </Label>
            <Input
              id="fine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Curfew Violation"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fine-amount" className="text-right">
              Amount
            </Label>
            <Input
              id="fine-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 100.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fine-description" className="text-right">
              <div className="flex flex-col md:flex-row md:items-center">
                <span>Description</span>
                <span className="text-xs text-gray-500 md:ml-2 mt-1 md:mt-0">
                  ({description.length}/300)
                </span>
              </div>
            </Label>
            <Textarea
              id="fine-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="(Optional) Any details about this fine."
              maxLength={300}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? isEditing ? "Updating..." : "Adding..."
              : isEditing ? "Update Fine" : "Add Fine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
