"use client";

import {
  Mail,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdminDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { Bill } from "@/features/payments/data";

interface KPI {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { snapshot, loading } = useAdminDashboard(user?.dormitoryId ?? null);

  if (loading || !snapshot) {
    return <AdminDashboardSkeleton />;
  }

  const kpiData: KPI[] = [
    {
      title: "Dorm Fund Balance",
      value: `₱${formatAmount(snapshot.totalCollected)}`,
      description: "Current available funds",
      icon: Wallet,
      trend: "up",
    },
    {
      title: "Total Collectibles",
      value: `₱${formatAmount(snapshot.outstanding)}`,
      description: "Remaining collectibles",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Unpaid Fines",
      value: `₱${formatAmount(snapshot.unpaidFinesTotal)}`,
      description: "Outstanding fine balance",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Active Dormers",
      value: `${snapshot.dormerCount}`,
      description: "Currently registered dormers",
      icon: Users,
      trend: "neutral",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
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

      {/* Desktop KPI Cards */}
      <div>
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} />
          ))}
        </div>
        <Carousel className="lg:hidden">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} />
          ))}
        </Carousel>
      </div>

      {/* Recent Bills */}
      <Card className="border border-gray-200 shadow-md bg-gradient-to-br from-white to-gray-50 gap-0">
        <CardHeader className="pb-2.5 sm:pb-3 md:pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#12372A]">
                Recent Bills
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Latest bills generated for your dormers
              </p>
            </div>
            {snapshot.recentBills.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0"
              >
                {snapshot.recentBills.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2.5 sm:pt-3 md:pt-4">
          {snapshot.recentBills.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12 px-3 sm:px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 mb-2 sm:mb-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-xs sm:text-sm md:text-base">
                No bills yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
              {snapshot.recentBills.map((bill) => (
                <BillRow key={bill.id} bill={bill} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon;
  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-semibold text-gray-600 truncate pr-2">
          {kpi.title}
        </CardTitle>
        <div
          className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${
            kpi.trend === "up"
              ? "bg-[#A5D6A7]"
              : kpi.trend === "down"
                ? "bg-red-100"
                : "bg-[#E0E0E0]"
          }`}
        >
          <Icon
            className={`h-4 w-4 sm:h-5 sm:w-5 ${
              kpi.trend === "up"
                ? "text-[#2E7D32]"
                : kpi.trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#333333]">
          {kpi.value}
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-1 sm:mt-1.5 truncate">
          {kpi.description}
        </p>
      </CardContent>
    </Card>
  );
}

function BillRow({ bill }: { bill: Bill }) {
  const tone =
    bill.status === "Paid"
      ? "text-[#2E7D32]"
      : bill.status === "Partial"
        ? "text-yellow-700"
        : "text-red-600";
  const bg =
    bill.status === "Paid"
      ? "bg-[#A5D6A7]"
      : bill.status === "Partial"
        ? "bg-yellow-100"
        : "bg-red-100";
  return (
    <div className="group relative flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-[#2E7D32] transition-all duration-200">
      <div
        className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${bg}`}
      >
        <TrendingUp className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm md:text-base font-semibold text-[#333333] truncate">
          {bill.description}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-xs text-gray-500">
            {bill.due_date ? formatDate(bill.due_date) : bill.billing_month}
          </span>
          <span className="text-gray-300 text-xs">•</span>
          <Badge
            variant="outline"
            className={`text-xs px-1.5 sm:px-2 py-0.5 h-4 sm:h-5 border-0 ${bg} ${tone}`}
          >
            {bill.status}
          </Badge>
        </div>
      </div>
      <div className={`flex-shrink-0 font-bold text-xs sm:text-sm md:text-base ${tone}`}>
        ₱{formatAmount(bill.total_amount_due)}
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-1.5 sm:space-y-2">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
        <Skeleton className="h-3 sm:h-4 w-56 sm:w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
