"use client";

import {
  Building,
  CalendarRange,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/format";
import { useSuperAdminDashboard } from "@/features/dashboard/hooks/useDashboard";

interface KPI {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function SuperAdminDashboardPage() {
  const { snapshot, loading } = useSuperAdminDashboard();

  if (loading || !snapshot) {
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
      </div>
    );
  }

  const kpiData: KPI[] = [
    {
      title: "Dormitories",
      value: `${snapshot.dormitoryCount}`,
      description: "Active dormitory buildings",
      icon: Building,
    },
    {
      title: "Total Dormers",
      value: `${snapshot.dormerCount}`,
      description: "Registered across all dormitories",
      icon: Users,
    },
    {
      title: "Collected",
      value: `${formatAmount(snapshot.totalCollected)}`,
      description: "Lifetime payments recorded",
      icon: TrendingUp,
    },
    {
      title: "Outstanding",
      value: `${formatAmount(snapshot.outstanding)}`,
      description: "Across all dormitories",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-700 mt-1 sm:mt-1.5">
            Platform-wide overview across all dormitories
          </p>
        </div>
      </div>

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

      <Card className="border border-gray-200 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-zinc-900">
            Current Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
              <CalendarRange className="h-5 w-5 text-zinc-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {snapshot.currentAcademicYear ?? "—"}
              </p>
              <p className="text-xs text-zinc-500">
                {snapshot.currentSemester
                  ? `${snapshot.currentSemester} semester`
                  : "No active period set"}
              </p>
            </div>
          </div>
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
        <div className="p-2 sm:p-2.5 rounded-xl flex-shrink-0 bg-zinc-100">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900">
          {kpi.value}
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-1 sm:mt-1.5 truncate">
          {kpi.description}
        </p>
      </CardContent>
    </Card>
  );
}
