import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "neutral";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: Trend;
}

const trendStyles: Record<Trend, { wrapper: string; icon: string }> = {
  up: { wrapper: "bg-[#A5D6A7]", icon: "text-[#2E7D32]" },
  down: { wrapper: "bg-red-100", icon: "text-red-600" },
  neutral: { wrapper: "bg-[#E0E0E0]", icon: "text-gray-600" },
};

export function KpiCard({ title, value, description, icon: Icon, trend }: KpiCardProps) {
  const styles = trendStyles[trend];

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-semibold text-gray-600 truncate pr-2">
          {title}
        </CardTitle>
        <div className={cn("p-2 sm:p-2.5 rounded-xl flex-shrink-0", styles.wrapper)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", styles.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#333333]">
          {value}
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-1 sm:mt-1.5 truncate">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}