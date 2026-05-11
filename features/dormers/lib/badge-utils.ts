import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

interface BadgeInfo {
  className: string;
  Icon: ComponentType<LucideProps> | null;
}

export const getStatusBadgeInfo = (status: string): BadgeInfo => {
  switch (status) {
    case "Paid":
      return { className: "bg-green-100 text-green-800", Icon: CheckCircle };
    case "Unpaid":
      return { className: "bg-yellow-100 text-yellow-800", Icon: Clock };
    case "Partial":
      return { className: "bg-blue-100 text-blue-800", Icon: DollarSign };
    case "Waived":
      return { className: "bg-gray-100 text-gray-700", Icon: AlertCircle };
    default:
      return { className: "bg-gray-100 text-gray-800", Icon: AlertCircle };
  }
};
