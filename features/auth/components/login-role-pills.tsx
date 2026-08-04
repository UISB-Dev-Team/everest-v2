"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Building } from "lucide-react";

export type LoginRole = "user" | "admin" | "super";

const ROLE_OPTIONS: { id: LoginRole; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: "user", label: "Dormer", sub: "Dormer Portal", Icon: GraduationCap },
  { id: "admin", label: "Admin", sub: "Console", Icon: Briefcase },
  { id: "super", label: "Super Admin", sub: "Services", Icon: Building },
];

interface LoginRolePillsProps {
  role: LoginRole;
  onChange: (role: LoginRole) => void;
}

export function LoginRolePills({ role, onChange }: LoginRolePillsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-[#f4f3ef] rounded-2xl relative border border-[#e7e3d8]">
      {ROLE_OPTIONS.map(({ id, label, sub, Icon }) => {
        const active = role === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl cursor-pointer select-none transition-colors duration-200"
            style={{
              color: active ? "#12372a" : "#6b7a72",
            }}
          >
            {active && (
              <motion.div
                layoutId="activeRoleSegment"
                className="absolute inset-0 bg-white rounded-[10px] shadow-sm border border-[#e7e3d8]"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-1 text-center">
              <Icon
                size={16}
                className={`transition-colors duration-200 ${active ? "text-[#2e7d32]" : "text-[#6b7a72]"
                  }`}
              />
              <div className="text-[12px] font-bold tracking-tight leading-none">
                {label}
              </div>
              <div className="text-[9px] font-medium tracking-wide opacity-70 leading-none">
                {sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
