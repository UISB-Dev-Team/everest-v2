"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel } from "@/components/ui/carousel";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  PlusIcon,
  Mail,
} from "lucide-react";

import type { RegularCharge } from "@/features/regular-charges/data/types";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { KpiCard } from "./kpi-card";
import { PayableItem } from "./payable-item";
import { RecentTransactionItem } from "./recent-transaction-item";
import AddPayableModal from "@/features/regular-charges/components/admin/add-payable-modal";
import { useRegularCharges } from "@/features/regular-charges/hooks/useRegularCharges";
import { regularChargesData } from "@/features/regular-charges/data";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { stats, loading, error } = useDashboard();
  const { savePayable, payables: regularCharges, setPayables } = useRegularCharges()


  // Modal state — keep here since modals are page-level concerns
  const [isAddPayableOpen, setIsAddPayableOpen] = useState(false);
  const [payableToEdit, setPayableToEdit] = useState<RegularCharge | null>(null);
  const [savingPayable, setIsSavingPayable] = useState(false)

  if (loading) return <DashboardSkeleton />;

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <p className="text-sm text-red-500">{error ?? "Something went wrong."}</p>
      </div>
    );
  }

  const { summary, dormers, recentPayments } = stats;

  // ── Derived values ──────────────────────────────────────────────────────────
  const fundBalance = summary.totalPaid; // total collected
  const collectibles = summary.remaining;
  const activeDormers = dormers.length;

  // ── KPI config ──────────────────────────────────────────────────────────────
  const kpiData = [
    {
      title: "Dorm Fund Balance",
      value: `₱${formatAmount(fundBalance)}`,
      description: "Total collected this period",
      icon: Wallet,
      trend: "up" as const,
    },
    {
      title: "Total Collectibles",
      value: `₱${formatAmount(collectibles)}`,
      description: "Remaining outstanding balance",
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      title: "Total Billed",
      value: `₱${formatAmount(summary.totalDue)}`,
      description: "Total amount due this period",
      icon: TrendingDown,
      trend: "down" as const,
    },
    {
      title: "Active Dormers",
      value: `${activeDormers}`,
      description: "Currently enrolled dormers",
      icon: Users,
      trend: "neutral" as const,
    },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddPayable = () => {
    setPayableToEdit(null);
    setIsAddPayableOpen(true);
  };

  const handleEditPayable = (payable: RegularCharge) => {
    setPayableToEdit(payable);
    setIsAddPayableOpen(true);
  };

  const handleSavePayable = async (input: any) => {
    setIsSavingPayable(true)
    await savePayable({id: input.id, name: input.name, amount: input.amount, description: input.description})
    setIsSavingPayable(false)
  }

  const handleDeletePayble = async (payableId: string) => {
    await regularChargesData.remove(payableId);
    setPayables((prev) => prev.filter((p) => p.id !== payableId))
  }

  // Recent payments — most recent 5
  const recentFive = [...recentPayments]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            Real-time financial status of your dormitory
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all w-full sm:w-auto"
        >
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
          <span className="text-sm">Email Report</span>
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      {/* Desktop: 4-column grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Mobile: Carousel */}
      <Carousel className="lg:hidden">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </Carousel>

      {/* ── Regular Payables ── */}
      <Card className="border border-gray-200 sm:border-2 shadow-md sm:shadow-lg bg-gradient-to-br from-white via-[#A5D6A7]/5 to-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#A5D6A7]/10 rounded-full blur-3xl -z-0" />

        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#12372A] truncate">
                Regular Payables
              </CardTitle>
              {regularCharges.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0"
                >
                  {regularCharges.length}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm text-gray-600 truncate">
              Recurring monthly expenses
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={handleAddPayable}
            className="gap-2 bg-[#2E7D32] text-white hover:bg-[#54ba59] hover:text-white w-full sm:w-auto text-xs sm:text-sm touch-manipulation active:scale-95 flex-shrink-0"
          >
            <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Add Payable</span>
          </Button>
        </CardHeader>

        <CardContent className="relative z-10">
          {regularCharges.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F5E9] mb-3 sm:mb-4">
                <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-[#2E7D32]" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#12372A] mb-1.5 sm:mb-2">
                No Payables Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                Start by adding your first recurring expense
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPayable}
                className="gap-2 bg-[#2E7D32] text-white hover:bg-[#54ba59] hover:text-white text-xs sm:text-sm"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add First Payable
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {regularCharges.map((charge) => (
                <PayableItem
                  key={charge.id}
                  payable={charge}
                  onEdit={handleEditPayable}
                  onDelete={handleDeletePayble}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Payments ── */}
      <Card className="border border-gray-200 shadow-md bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2.5 sm:pb-3 md:pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#12372A] truncate">
                Recent Payments
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                Latest recorded payment activities
              </p>
            </div>
            {recentFive.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0"
              >
                {recentFive.length}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-2.5 sm:pt-3 md:pt-4">
          {recentFive.length === 0 ? (
            <div className="text-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 mb-2 sm:mb-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-xs sm:text-sm">No payments yet</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                Payments will appear here once recorded
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
              {recentFive.map((payment) => (
                <RecentTransactionItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      {/* Wire up your existing AddPayableModal here */}
      <AddPayableModal
        isOpen={isAddPayableOpen}
        isSavingPayable={savingPayable}
        onClose={() => setIsAddPayableOpen(false)}
        payable={payableToEdit}
        onSave={handleSavePayable}
      /> 
    </div>
  );
}