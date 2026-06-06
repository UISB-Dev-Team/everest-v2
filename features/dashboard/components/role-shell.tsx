"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/hooks/useAuth";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface RoleShellProps {
  navItems: NavItem[];
  brandLabel: string;
  brandSubLabel?: string;
  userInitials?: string | null;
  userPrimaryLine?: string | null;
  userSecondaryLine?: string | null;
  variant?: "dorm" | "super-admin";
  /** Rendered in a sticky strip between the sidebar header and the scrollable content */
  subHeader?: ReactNode;
  children: ReactNode;
  dorm_logo?: string | null;
}

export function RoleShell({
  navItems,
  brandLabel,
  brandSubLabel,
  userInitials,
  userPrimaryLine,
  userSecondaryLine,
  variant = "dorm",
  subHeader,
  children,
  dorm_logo
}: RoleShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const isSuperAdmin = variant === "super-admin";

  const sidebarBase = isSuperAdmin
    ? "bg-zinc-900 text-white"
    : "bg-[#12372A] text-white";

  const headerBase = isSuperAdmin
    ? "bg-zinc-900"
    : "bg-[#12372A]";

  return (
    // Full-screen, no overflow — only <main> scrolls
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f0f0]">

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className={cn("hidden md:flex w-64 flex-shrink-0 flex-col", sidebarBase)}>
        <SidebarContent
          variant={variant}
          navItems={navItems}
          pathname={pathname}
          brandLabel={brandLabel}
          brandSubLabel={brandSubLabel}
          userInitials={userInitials}
          userPrimaryLine={userPrimaryLine}
          userSecondaryLine={userSecondaryLine}
          onNavigate={() => {}}
          onSignOut={handleSignOut}
          dorm_logo={dorm_logo}
        />
      </aside>

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar — sticky, never scrolls */}
        <header
          className={cn(
            "md:hidden flex-shrink-0 sticky top-0 z-30 flex h-[74px] items-center justify-between px-4 shadow-md",
            headerBase
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="rounded-md p-2 text-white hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
           <img
            src={dorm_logo ? dorm_logo : "/profile-old.webp"}
            alt="DormPay logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
            <h1 className="text-xl font-bold text-white tracking-tight">
              DormPay
            </h1>
          </div>
          <div className="w-10" />
        </header>

        {/* Sticky subheader — rendered only when provided */}
        {subHeader && (
          <div className="flex-shrink-0 border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-4 py-2.5">
            {subHeader}
          </div>
        )}

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={cn(
                "absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl",
                sidebarBase
              )}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-md p-2 text-white/80 hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent
                variant={variant}
                navItems={navItems}
                pathname={pathname}
                brandLabel={brandLabel}
                brandSubLabel={brandSubLabel}
                userInitials={userInitials}
                userPrimaryLine={userPrimaryLine}
                userSecondaryLine={userSecondaryLine}
                onNavigate={() => setMobileOpen(false)}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SidebarContent — unchanged from original ─────────────────────────────────

interface SidebarContentProps {
  variant: "dorm" | "super-admin";
  navItems: NavItem[];
  pathname: string;
  brandLabel: string;
  brandSubLabel?: string;
  userInitials?: string | null;
  userPrimaryLine?: string | null;
  userSecondaryLine?: string | null;
  onNavigate: () => void;
  onSignOut: () => void;
  dorm_logo?: string | null
}

function SidebarContent({
  variant,
  navItems,
  pathname,
  brandLabel,
  brandSubLabel,
  userInitials,
  userPrimaryLine,
  userSecondaryLine,
  onNavigate,
  onSignOut,
  dorm_logo,
}: SidebarContentProps) {
  const isSuperAdmin = variant === "super-admin";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6 flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
          <img
            src={dorm_logo ? dorm_logo : "/profile-old.webp"}
            alt="DormPay logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none">{brandLabel}</span>
          {brandSubLabel && (
            <span
              className={cn(
                "mt-1 text-[11px]",
                isSuperAdmin
                  ? "uppercase tracking-[0.15em] text-white/50"
                  : "text-white/80"
              )}
            >
              {brandSubLabel}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ title, url, icon: Icon }) => {
            const active = pathname === url;
            return (
              <li key={url}>
                <Link
                  href={url}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 transition-all duration-200",
                    active
                      ? isSuperAdmin
                        ? "bg-white text-zinc-900 font-medium"
                        : "bg-white text-[#12372A] font-medium"
                      : isSuperAdmin
                        ? "text-white/60 hover:bg-white/10 hover:text-white"
                        : "text-white hover:bg-white hover:text-[#12372A]"
                  )}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">{title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-4">
        {(userPrimaryLine || userSecondaryLine) && (
          <div className="mb-3 flex items-start gap-2 pb-2">
            <Avatar className={cn("h-9 w-9", isSuperAdmin && "border border-white/20")}>
              <AvatarFallback
                className={cn(
                  "text-sm font-medium",
                  isSuperAdmin
                    ? "bg-white/10 text-white"
                    : "bg-green-100 text-green-800"
                )}
              >
                {userInitials ?? "—"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {userPrimaryLine && (
                <p className="truncate text-sm font-medium text-white">
                  {userPrimaryLine}
                </p>
              )}
              {userSecondaryLine && (
                <p className={cn("truncate text-xs", isSuperAdmin ? "text-white/50" : "text-gray-100")}>
                  {userSecondaryLine}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-white/80 transition-all duration-200 hover:bg-red-500 hover:text-white"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="text-sm font-medium">Sign Out</span>
          <span className="ml-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}