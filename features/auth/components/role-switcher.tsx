"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authData } from "@/features/auth/data";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { homePathFor } from "@/features/auth/lib/role-home";
import type { AuthRole } from "@/features/auth/data";

const ROLE_OPTIONS: Array<{
  value: AuthRole | "unauthenticated";
  label: string;
}> = [
  { value: "dormer", label: "Dormer" },
  { value: "adviser", label: "Admin · Adviser" },
  { value: "treasurer", label: "Admin · Treasurer" },
  { value: "auditor", label: "Admin · Auditor" },
  { value: "sa", label: "Admin · SA" },
  { value: "super_admin", label: "Super Admin" },
  { value: "unauthenticated", label: "Signed Out" },
];

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (process.env.NODE_ENV === "production") return null;

  const handleSelect = (value: AuthRole | "unauthenticated") => {
    authData.setMockRole?.(value);
    setOpen(false);
    const redirect =
      value === "unauthenticated" ? "/login" : homePathFor(value);
    router.push(redirect);
  };

  const currentLabel = user
    ? ROLE_OPTIONS.find((o) => o.value === user.role)?.label ?? user.role
    : "Signed Out";

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {open && (
        <div className="mb-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-500">
            Mock Role (dev only)
          </div>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full rounded-md px-2 py-1.5 text-left hover:bg-gray-100 ${
                (user?.role ?? "unauthenticated") === opt.value
                  ? "bg-gray-100 font-semibold"
                  : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-[var(--brand)] px-3 py-2 text-white shadow-lg hover:bg-[var(--brand-hover)]"
      >
        ⚙ {currentLabel}
      </button>
    </div>
  );
}
