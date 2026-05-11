"use client";

import { useEffect, useState } from "react";
import { Building2, Info, MapPin } from "lucide-react";
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
import type {
  CreateDormitoryInput,
  Dormitory,
  UpdateDormitoryInput,
} from "@/features/dormitories/data";

type Mode = "add" | "edit";

interface AddEditDormitoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormitory: Dormitory | null;
  mode: Mode;
  onAdd: (input: CreateDormitoryInput) => Promise<void> | void;
  onUpdate: (id: string, input: UpdateDormitoryInput) => Promise<void> | void;
}

export default function AddEditDormitoryModal({
  isOpen,
  onClose,
  dormitory,
  mode,
  onAdd,
  onUpdate,
}: AddEditDormitoryModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setName(dormitory?.name ?? "");
      setLocation(dormitory?.location ?? "");
      setCapacity(dormitory?.capacity ?? 0);
    }
  }, [dormitory, isOpen]);

  const handleSave = async () => {
    if (!name || !location) {
      toast.error("Please fill in all fields!");
      return;
    }
    if (mode === "add") {
      await onAdd({
        name,
        location,
        capacity,
      });
    } else if (dormitory) {
      await onUpdate(dormitory.id, {
        name,
        location,
        capacity,
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
              <Building2 className="h-5 w-5 text-neutral-700" />
            </div>
            {mode === "add" ? "Add New Dormitory" : "Edit Dormitory Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Complete the form below to add a new building to the university dormitory registry."
              : "Update the building information and status for the dormitory registry."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-1.5">
            <Label
              htmlFor="name"
              className="text-[13px] font-medium text-neutral-700 flex items-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
              Building Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Narra Residence"
              value={name}
              className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="capacity"
              className="text-[13px] font-medium text-neutral-700 flex items-center gap-1.5"
            >
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              Capacity
            </Label>
            <Input
              id="capacity"
              placeholder="e.g. 100"
              value={capacity}
              type="number"
              className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="location"
              className="text-[13px] font-medium text-neutral-700 flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g. North Campus"
              value={location}
              className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
              onChange={(e) => setLocation(e.target.value)}
            />
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
            {mode === "add" ? "Register Dormitory" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
