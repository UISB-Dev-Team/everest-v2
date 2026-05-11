"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderDormitory({
  onAddDormitory,
}: {
  onAddDormitory: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-neutral-100 bg-white px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            Super Admin
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Dormitory Registry
        </h1>
        <p className="text-[15px] text-neutral-500 mt-1 font-normal">
          Manage university dormitories
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onAddDormitory}
          className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2 font-medium shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Register Dormitory
        </Button>
      </div>
    </header>
  );
}
