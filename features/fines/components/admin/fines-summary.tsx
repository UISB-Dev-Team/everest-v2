"use client";

import { Calendar, Tag, TrendingDown, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { formatAmount } from "@/lib/utils/format";
import type { FineStatistics } from "@/features/fines/data";

interface KPI {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

export default function FinesSummary({
  totalFines,
  collectedFines,
  collectibleFines,
}: FineStatistics) {
  const kpiData: KPI[] = [
    {
      title: "Total Fines",
      value: `${formatAmount(totalFines)}`,
      description: "All recorded fines",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Collectible Fines",
      value: `${formatAmount(collectibleFines)}`,
      description: "Fines that can be collected",
      icon: Calendar,
      trend: "neutral",
    },
    {
      title: "Collected Fines",
      value: `${formatAmount(collectedFines)}`,
      description: "Fines collected",
      icon: Tag,
      trend: "up",
    },
  ];

  return (
    <>
      <Carousel className="lg:hidden">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </Carousel>

      <div className="hidden lg:grid lg:grid-cols-3 gap-4 md:gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>
    </>
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
