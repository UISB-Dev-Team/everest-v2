"use client";

import { GraduationCap, Briefcase, Building } from "lucide-react";

export type LoginRole = "user" | "admin" | "super";

const ROLE_OPTIONS: { id: LoginRole; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: "user",  label: "Dormer", sub: "Dormer portal",  Icon: GraduationCap },
  { id: "admin", label: "Admin",  sub: "Dorm Admin console", Icon: Briefcase },
  { id: "super", label: "Super",  sub: "Student Services",       Icon: Building },
];

interface LoginRolePillsProps {
  role: LoginRole;
  onChange: (role: LoginRole) => void;
}

export function LoginRolePills({ role, onChange }: LoginRolePillsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {ROLE_OPTIONS.map(({ id, label, sub, Icon }) => {
        const active = role === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex items-center gap-2 text-left p-3 rounded-xl transition-colors cursor-pointer"
            style={{
              background: active ? "#f1f8f2" : "#fff",
              border: `1px solid ${active ? "#2e7d32" : "#e7e3d8"}`,
              color: active ? "#1c4f3d" : "#3a4a42",
              boxShadow: active ? "0 0 0 3px rgba(46,125,50,0.10)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.borderColor = "#a5d6a7";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.borderColor = "#e7e3d8";
            }}
          >
            <div
              className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0"
              style={{
                background: active ? "#2e7d32" : "#f1f8f2",
                color: active ? "#fff" : "#3a4a42",
              }}
            >
              <Icon size={13} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold leading-none">{label}</div>
              <div className="text-[11px] mt-1 opacity-60 leading-none">{sub}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
