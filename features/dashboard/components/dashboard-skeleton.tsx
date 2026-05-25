import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1.5 sm:space-y-2">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
        <Skeleton className="h-3 sm:h-4 w-56 sm:w-72" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-2/4" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payables */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-1.5 sm:mb-2" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-56" />
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <Skeleton className="h-5 sm:h-6 w-40 sm:w-48 mb-1 sm:mb-2" />
          <Skeleton className="h-3 w-48 sm:w-64" />
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 p-3 sm:p-4 border border-gray-100 rounded-lg">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
                <Skeleton className="h-4 sm:h-5 flex-1" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
              <div className="flex items-center gap-2 pl-11 sm:pl-[52px]">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}