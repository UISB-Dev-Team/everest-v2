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
import type { RegularCharge } from "@/features/regular-charges/data";

interface AddPayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payable: {
    id?: string;
    name: string;
    amount: number;
    description: string;
  }) => Promise<void> | void;
  payable: RegularCharge | null;
}

export default function AddPayableModal({
  isOpen,
  onClose,
  onSave,
  payable,
}: AddPayableModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = Boolean(payable);

  useEffect(() => {
    if (isOpen && isEditing && payable) {
      setName(payable.name || "");
      setAmount(String(payable.amount) || "");
      setDescription(payable.description || "");
    } else if (isOpen) {
      setName("");
      setAmount("");
      setDescription("");
    }
  }, [isOpen, payable, isEditing]);

  const handleSave = async () => {
    if (!name || !amount) {
      toast.info("Title and Amount are required.");
      return;
    }
    await onSave({
      ...(isEditing && payable ? { id: payable.id } : {}),
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
            {isEditing ? "Edit Payable" : "Add New Payable"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this payable."
              : "Fill in the details to add a new payable."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name{" "}
              <span className="text-xs text-gray-500">
                ({name.length}/100)
              </span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Monthly Rent"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 500.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              <div className="flex flex-col md:flex-row md:items-center">
                <span>Description</span>
                <span className="text-xs text-gray-500 md:ml-2 mt-1 md:mt-0">
                  ({description.length}/300)
                </span>
              </div>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="(Optional) Any details about this payable."
              maxLength={300}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {isEditing ? "Update Payable" : "Add Payable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
