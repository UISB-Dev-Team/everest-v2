"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdviserHeaderProps {
  onAddAdviser: () => void;
}

export default function AdviserHeader({ onAddAdviser }: AdviserHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-neutral-100 bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            Super Admin
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Adviser Management
        </h1>
        <p className="text-[15px] text-neutral-500 mt-1 font-normal">
          Manage and monitor all dormitory advisers
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onAddAdviser}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-sm transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Adviser
        </Button>
      </div>
    </header>
  );
}
