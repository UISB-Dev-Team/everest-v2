"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Loader2, Upload, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Expense, UpdateExpenseInput } from "@/features/expenses/data";
import { uploadReceiptImage } from "../../data/supabase";

interface ViewEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (id: string, input: UpdateExpenseInput) => Promise<void> | void;
  isReadOnly?: boolean;
}

interface ExpenseForm {
  title: string;
  description: string;
  amount: string;
  expense_date: string;
  category: string;
  receipt_image_url: string | null;
}

export default function ViewEditExpenseModal({
  isOpen,
  onClose,
  expense,
  onSave,
  isReadOnly,
}: ViewEditExpenseModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExpenseForm | null>(null);
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isOpen && expense) {
      setFormData({
        title: expense.title,
        description: expense.description ?? "",
        amount: String(expense.amount),
        expense_date: expense.expense_date,
        category: expense.category ?? "Other",
        receipt_image_url: expense.receipt_image_url ?? null,
      });
      setReceiptPreview(expense.receipt_image_url ?? null);
      setNewReceiptFile(null);
      setIsEditing(false);
      setImgError(false);
    }
  }, [isOpen, expense]);

  if (!isOpen || !formData || !expense) return null;

  const handleInputChange = (field: keyof ExpenseForm, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileUrl = await uploadReceiptImage(file);
        setNewReceiptFile(file);
        setReceiptPreview(fileUrl);
      } catch (error) {
        toast.error("Failed to upload receipt image");
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      // Real upload to Supabase Storage wired up later. Keep preview URL.
      const receipt_image_url = newReceiptFile
        ? receiptPreview
        : formData.receipt_image_url;

      await onSave(expense.id, {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        category: formData.category,
        receipt_image_url,
      });
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleCancelEdit = () => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description ?? "",
        amount: String(expense.amount),
        expense_date: expense.expense_date,
        category: expense.category ?? "Other",
        receipt_image_url: expense.receipt_image_url ?? null,
      });
      setReceiptPreview(expense.receipt_image_url ?? null);
    } else {
      setFormData(null);
      setReceiptPreview(null);
    }
    setNewReceiptFile(null);
    setIsEditing(false);
    setImgError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Expense Details"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this expense."
              : `Viewing details for expense: ${expense.title}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Receipt</Label>
            {isEditing ? (
              <div>
                {receiptPreview ? (
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      width={500}
                      height={300}
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => {
                        setNewReceiptFile(null);
                        setReceiptPreview(null);
                        setFormData((prev) =>
                          prev ? { ...prev, receipt_image_url: null } : prev
                        );
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <input
                      type="file"
                      id="receipt-edit-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("receipt-edit-upload")
                          ?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {receiptPreview && !imgError ? (
                  <img
                    src={receiptPreview}
                    alt="Expense Receipt"
                    width={800}
                    height={400}
                    className="w-full h-auto max-h-80 object-contain rounded-md border"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="text-sm text-center text-gray-500 p-4 border rounded-md">
                    No receipt image available.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title{" "}
                {isEditing && (
                  <span className="text-xs text-gray-500">
                    ({formData.title.length}/100)
                  </span>
                )}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={!isEditing}
                maxLength={100}
                className="disabled:opacity-100 disabled:cursor-default"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="disabled:opacity-100 disabled:cursor-default">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                disabled={!isEditing}
                className="disabled:opacity-100 disabled:cursor-default"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Expense Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  handleInputChange("expense_date", e.target.value)
                }
                disabled={!isEditing}
                className="disabled:opacity-100 disabled:cursor-default"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">
                Description{" "}
                {isEditing && (
                  <span className="text-xs text-gray-500">
                    ({formData.description.length}/500)
                  </span>
                )}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={!isEditing}
                maxLength={500}
                className="disabled:opacity-100 disabled:cursor-default min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                {!isReadOnly && (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
