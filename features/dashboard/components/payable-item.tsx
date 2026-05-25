import { Button } from "@/components/ui/button";
import { Wallet, Edit, X } from "lucide-react";
import type { RegularCharge } from "@/features/regular-charges/data/types";

interface PayableItemProps {
  payable: RegularCharge;
  onEdit: (payable: RegularCharge) => void;
  onDelete: (payableId: string) => void
}

export function PayableItem({ payable, onEdit, onDelete }: PayableItemProps) {
  return (
    <div className="group relative rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-[#A5D6A7]/5 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] sm:hover:scale-[1.02]">
      {/* accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2E7D32] to-[#A5D6A7] rounded-l-xl" />

      <div className="flex items-start justify-between pl-2 sm:pl-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#A5D6A7]/30 flex-shrink-0">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2E7D32]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#333333] group-hover:text-[#2E7D32] transition-colors truncate">
              {payable.name || "Untitled Payable"}
            </h3>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-[#2E7D32] mb-1.5 sm:mb-2 tracking-tight">
            ₱{payable.amount.toFixed(2)}
          </p>

          {payable.description && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {payable.description}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 sm:opacity-0 opacity-100 transition-all group-hover:opacity-100 hover:bg-[#2E7D32] hover:text-white active:bg-[#2E7D32] active:text-white -mt-1 -mr-1"
          onClick={() => onEdit(payable)}
          aria-label={`Edit ${payable.name}`}
        >
          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 sm:opacity-0 opacity-100 transition-all group-hover:opacity-100 hover:bg-[#2E7D32] hover:text-white active:bg-[#2E7D32] active:text-white -mt-1 -mr-1"
          onClick={() => onDelete(payable?.id!)}
          aria-label={`Delete ${payable.name}`}
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}