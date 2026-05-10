"use client";

import { TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { formatAmount } from "@/lib/utils/format";

interface SummaryCardsProps {
  totalAmountDue: number;
  totalAmountPaid: number;
  totalRemainingBalance: number;
}

interface KPI {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

export default function SummaryCards({
  totalAmountDue,
  totalAmountPaid,
  totalRemainingBalance,
}: SummaryCardsProps) {
  const kpiData: KPI[] = [
    {
      title: "Total Amount Due",
      value: `${formatAmount(totalAmountDue)}`,
      description: "Total bills generated",
      icon: Wallet,
      trend: "neutral",
    },
    {
      title: "Total Amount Paid",
      value: `${formatAmount(totalAmountPaid)}`,
      description: "Successfully collected",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Total Remaining Balance",
      value: `${formatAmount(totalRemainingBalance)}`,
      description: "Outstanding balance",
      icon: TrendingDown,
      trend: "down",
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
