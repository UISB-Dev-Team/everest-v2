"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, User } from "lucide-react";
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
import type {
  Adviser,
  CreateAdviserInput,
  DormitoryRole,
  UpdateAdviserInput,
} from "@/features/advisers/data";
import type { Dormitory } from "@/features/dormitories/data";

type Mode = "add" | "edit";

interface AddEditAdviserModalProps {
  isOpen: boolean;
  onClose: () => void;
  adviser: Adviser | null;
  mode: Mode;
  dormitories: Dormitory[];
  onAdd: (input: CreateAdviserInput) => Promise<void> | void;
  onUpdate: (input: UpdateAdviserInput) => Promise<void> | void;
}

export default function AddEditAdviserModal({
  isOpen,
  onClose,
  adviser,
  mode,
  dormitories,
  onAdd,
  onUpdate,
}: AddEditAdviserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dormitoryId, setDormitoryId] = useState("");
  const [role, setRole] = useState<DormitoryRole["role"]>("adviser");

  useEffect(() => {
    if (isOpen) {
      setFirstName(adviser?.first_name ?? "");
      setLastName(adviser?.last_name ?? "");
      setEmail(adviser?.email ?? "");
      setPhone(adviser?.phone ?? "");
      setDormitoryId(adviser?.dormitory_id ?? "");
      setRole(adviser?.role ?? "adviser");
    }
  }, [adviser, isOpen]);

  const handleSave = async () => {
    if (!firstName || !lastName || !email || !phone || !dormitoryId) {
      toast.error("Please fill in all fields!");
      return;
    }
    if (mode === "add") {
      await onAdd({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        dormitory_id: dormitoryId,
        role,
      });
    } else if (adviser) {
      await onUpdate({
        id: adviser.role_id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        dormitory_id: dormitoryId,
        role,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <User className="h-5 w-5 text-neutral-700" />
            </div>
            {mode === "add" ? "Add New Adviser" : "Edit Adviser"}
          </DialogTitle>
          <DialogDescription className="text-[15px] text-neutral-500">
            {mode === "add"
              ? "Register a new dormitory adviser to the system."
              : "Update the contact information for this adviser."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-medium text-neutral-700">
                First Name
              </Label>
              <Input
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-medium text-neutral-700">
                Last Name
              </Label>
              <Input
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[13px] font-medium text-neutral-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="john.doe@vsu.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-medium text-neutral-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                Phone Number
              </Label>
              <Input
                placeholder="0917XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-medium text-neutral-700">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as DormitoryRole["role"])
                }
              >
                <SelectTrigger className="border-neutral-200 h-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="sa">SA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[13px] font-medium text-neutral-700">
              Dormitory
            </Label>
            <Select value={dormitoryId} onValueChange={setDormitoryId}>
              <SelectTrigger className="border-neutral-200 h-10">
                <SelectValue placeholder="Select dormitory" />
              </SelectTrigger>
              <SelectContent>
                {dormitories.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-neutral-100 text-neutral-600 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
          >
            {mode === "add" ? "Add Adviser" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
