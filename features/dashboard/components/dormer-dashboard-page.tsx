"use client";

import {
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormerDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { Bill } from "@/features/payments/data";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: typeof DollarSign;
  color: string;
}

export function DormerDashboardPage() {
  const { user } = useAuth();
  const { snapshot, loading } = useDormerDashboard(user?.id ?? null);

  if (loading || !snapshot) {
    return <DashboardSkeleton />;
  }

  const totalDue = snapshot.totalBilled;
  const totalPayments = snapshot.totalPaid;
  const remainingBalance = snapshot.outstanding;
  const totalExpenses = 0; // expenses feature deferred
  const bills = snapshot.recentBills;

  const statsCards: StatCard[] = [
    {
      title: "Total Amount Due",
      value: `₱${formatAmount(totalDue)}`,
      description: "Amount to be Paid by Dormers",
      icon: DollarSign,
      color: "text-[#12372A]",
    },
    {
      title: "Total Amount Paid",
      value: `₱${formatAmount(totalPayments)}`,
      description: "Overall Payments",
      icon: TrendingUp,
      color: "text-[#2E7D32]",
    },
    {
      title: "Dorm Fund Balance",
      value: `₱${formatAmount(remainingBalance)}`,
      description: "Available Money",
      icon: Wallet,
      color: "text-red-600",
    },
    {
      title: "Total Dorm Expenses",
      value: `₱${formatAmount(totalExpenses)}`,
      description: "Overall Expenses",
      icon: TrendingDown,
      color: "text-[#2E7D32]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            View dormitory funds summary
          </p>
        </div>
      </div>

      <div>
        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          {statsCards.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>

        {/* Mobile carousel */}
        <Carousel className="lg:hidden">
          {statsCards.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </Carousel>
      </div>

      {/* Payment Overview */}
      <Card className="border border-gray-200 shadow-md bg-white">
        <CardHeader className="pb-3 sm:pb-4 lg:pb-3">
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-lg font-bold text-[#12372A]">
            Payment Overview
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600">
            Your recent payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-8 px-3 sm:px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 rounded-full bg-[#E8F5E9] mb-3 sm:mb-4 lg:mb-3">
                <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 lg:h-6 lg:w-6 text-[#2E7D32]" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-base font-semibold text-[#12372A] mb-1.5 sm:mb-2 lg:mb-1.5">
                No Payment History
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Your payment history will appear here once you make your first
                payment.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 lg:space-y-2.5">
              {bills.map((bill) => (
                <BillRow key={bill.id} bill={bill} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ stat }: { stat: StatCard }) {
  const Icon = stat.icon;
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-[#2E7D32]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 truncate pr-2">
            {stat.title}
          </CardTitle>
          <div className="p-2 bg-[#E8F5E9] rounded-lg flex-shrink-0">
            <Icon className="h-5 w-5 text-[#2E7D32]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        <p className="text-xs text-slate-500 mt-1 truncate">
          {stat.description}
        </p>
      </CardContent>
    </Card>
  );
}

function BillRow({ bill }: { bill: Bill }) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 lg:p-3 border border-slate-200 rounded-lg hover:border-[#2E7D32] transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm sm:text-base lg:text-sm text-[#12372A] truncate">
          Period {bill.billing_month}
        </p>
        <p className="text-xs sm:text-sm lg:text-xs text-slate-500 truncate">
          Amount: ₱{formatAmount(bill.total_amount_due)}
        </p>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className="font-medium text-sm sm:text-base lg:text-sm text-[#12372A]">
          ₱{formatAmount(bill.amount_paid)}
        </p>
        <span
          className={`text-xs sm:text-sm lg:text-xs px-2 py-0.5 sm:py-1 lg:py-0.5 rounded inline-block mt-1 font-medium ${
            bill.status === "Paid"
              ? "bg-[#E8F5E9] text-[#2E7D32]"
              : bill.status === "Partial"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {bill.status}
        </span>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8 space-y-6">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="mb-8">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24 mb-2" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
