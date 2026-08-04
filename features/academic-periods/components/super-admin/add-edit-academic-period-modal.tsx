"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Info } from "lucide-react";
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
  AcademicPeriod,
  CreateAcademicPeriodInput,
  UpdateAcademicPeriodInput,
} from "@/features/academic-periods/data";

type Mode = "add" | "edit";

interface AddEditAcademicPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: AcademicPeriod | null;
  mode: Mode;
  onAdd: (input: CreateAcademicPeriodInput) => Promise<void> | void;
  onUpdate: (id: string, input: UpdateAcademicPeriodInput) => Promise<void> | void;
}

export default function AddEditAcademicPeriodModal({
  isOpen,
  onClose,
  period,
  mode,
  onAdd,
  onUpdate,
}: AddEditAcademicPeriodModalProps) {
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<"1st" | "2nd" | "Summer">("1st");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAcademicYear(period?.academic_year ?? "");
      setSemester((period?.semester as "1st" | "2nd" | "Summer") ?? "1st");
      setStartDate(period?.start_date ?? "");
      setEndDate(period?.end_date ?? "");
      setIsCurrent(period?.is_current ?? false);
    }
  }, [period, isOpen]);

  const handleSave = async () => {
    if (!academicYear || !semester || !startDate || !endDate) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after the end date!");
      return;
    }

    // Validate Academic Year format (e.g. YYYY-YYYY)
    const ayRegex = /^\d{4}-\d{4}$/;
    if (!ayRegex.test(academicYear)) {
      toast.error("Academic Year must be in format YYYY-YYYY (e.g. 2024-2025)");
      return;
    }

    if (mode === "add") {
      await onAdd({
        academic_year: academicYear,
        semester,
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
      });
    } else if (period) {
      await onUpdate(period.id, {
        academic_year: academicYear,
        semester,
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
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
              <CalendarDays className="h-5 w-5 text-neutral-700" />
            </div>
            {mode === "add" ? "Register Academic Period" : "Edit Academic Period"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Register a new school academic period and semester in the system."
              : "Update dates and configurations for the academic period."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="academicYear"
                className="text-[13px] font-medium text-neutral-700"
              >
                Academic Year
              </Label>
              <Input
                id="academicYear"
                placeholder="e.g. 2024-2025"
                value={academicYear}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="semester"
                className="text-[13px] font-medium text-neutral-700"
              >
                Semester
              </Label>
              <Select
                value={semester}
                onValueChange={(val) =>
                  setSemester(val as "1st" | "2nd" | "Summer")
                }
              >
                <SelectTrigger className="border-neutral-200 h-10">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Semester</SelectItem>
                  <SelectItem value="2nd">2nd Semester</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="startDate"
                className="text-[13px] font-medium text-neutral-700"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="endDate"
                className="text-[13px] font-medium text-neutral-700"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                className="border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900 h-10"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
            <Label
              htmlFor="isCurrent"
              className="text-[13px] font-medium text-neutral-700 cursor-pointer"
            >
              Set as current active period
            </Label>
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
            {mode === "add" ? "Register Period" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
