import { Button } from "@/components/ui/button";
import { AlertCircle, Edit, X } from "lucide-react";
import type { FineCategory } from "@/features/fines/data";

interface FineCategoryItemProps {
  category: FineCategory;
  onEdit: (category: FineCategory) => void;
  onDelete: (categoryId: string) => void;
}

export function FineCategoryItem({ category, onEdit, onDelete }: FineCategoryItemProps) {
  return (
    <div className="group relative rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-red-50/10 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] sm:hover:scale-[1.02]">
      {/* accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 to-red-300 rounded-l-xl" />

      <div className="flex items-start justify-between pl-2 sm:pl-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100/50 flex-shrink-0">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#333333] group-hover:text-red-600 transition-colors truncate">
              {category.name || "Untitled Fine"}
            </h3>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mb-1.5 sm:mb-2 tracking-tight">
            ₱{category.amount.toFixed(2)}
          </p>

          {category.description && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {category.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 sm:opacity-0 opacity-100 transition-all group-hover:opacity-100 hover:bg-red-600 hover:text-white active:bg-red-600 active:text-white -mt-1 -mr-1"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 sm:opacity-0 opacity-100 transition-all group-hover:opacity-100 hover:bg-red-600 hover:text-white active:bg-red-600 active:text-white -mr-1"
            onClick={() => onDelete(category.id)}
            aria-label={`Delete ${category.name}`}
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
