import { Badge } from "@/components/ui/badge";
import { PaymentWithRecorder } from "@/features/payments/data";
import { TrendingUp } from "lucide-react";

interface RecentTransactionItemProps {
  payment: PaymentWithRecorder;
}

export function RecentTransactionItem({ payment }: RecentTransactionItemProps) {
  const date = payment.created_at ? new Date(payment.created_at) : new Date();
  const recorderName = payment.recorded_by_full_name ?? "Admin";

  return (
    <div className="group relative flex flex-col gap-2 sm:gap-2.5 p-2.5 sm:p-3 md:p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-[#2E7D32] transition-all duration-200 active:scale-[0.99] touch-manipulation">
      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
        <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-[#A5D6A7] group-hover:bg-[#2E7D32] transition-all duration-200">
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#2E7D32] group-hover:text-white transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm md:text-base font-semibold text-[#333333] line-clamp-2 group-hover:text-[#12372A] transition-colors leading-snug">
            Payment via {payment.payment_method ?? "—"} recorded by {recorderName}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
            <span className="text-xs text-gray-500">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-gray-300 text-xs">•</span>
            <Badge
              variant="outline"
              className="text-xs px-1.5 sm:px-2 py-0.5 h-4 sm:h-5 border-0 bg-[#A5D6A7]/20 text-[#2E7D32]"
            >
              Payment
            </Badge>
          </div>
        </div>

        <div className="flex-shrink-0 font-bold text-xs sm:text-sm md:text-base text-[#2E7D32]">
          +₱{payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}