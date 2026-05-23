"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
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
import { uploadReceiptImage } from "../../data/supabase";

export interface AddExpenseInput {
  title: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  receipt_image_url: string | null;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AddExpenseInput) => Promise<void> | void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    category: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        category: "",
      });
      setReceiptFile(null);
      setReceiptPreview(null);
    }
  }, [isOpen]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      toast.info("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const receipt_image_url = await uploadReceiptImage(receiptFile!);
      console.log(receipt_image_url);
      await onSave({
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        category: formData.category,
        receipt_image_url,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save expense: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for the dormitory. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title *{" "}
              <span className="text-xs text-gray-500">
                ({formData.title.length}/100)
              </span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Dorm Cleaning Materials"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="border-gray-300"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-xs text-gray-500">
                ({formData.description.length}/500)
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide details about this expense..."
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              className="border-gray-300 min-h-[80px]"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₱
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="border-gray-300 pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Expense Date *</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  handleInputChange("expense_date", e.target.value)
                }
                className="border-gray-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Image</Label>
            {!receiptPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload receipt image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("receipt-upload")?.click()
                  }
                  className="border-gray-300"
                >
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="relative border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-32 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeReceipt}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
