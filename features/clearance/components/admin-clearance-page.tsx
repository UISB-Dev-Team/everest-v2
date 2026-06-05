"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormitoryClearance } from "@/features/clearance/hooks/useClearance";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { DataPagination, FiltersBar, StatusBadge } from "@/components/ui/shared";
import { useClearanceTable } from "@/features/clearance/hooks/useClearanceTable";

export function AdminClearancePage() {
  const { user } = useAuth();
  const { selected, loading: periodLoading } = useAcademicPeriod();
  const { list, loading: listLoading } = useDormitoryClearance(
    user?.dormitoryId ?? null,
    selected?.id ?? null
  );
  const loading = periodLoading || listLoading;

  const {
    searchValue, setSearchValue,
    filterValue, setFilterValue,
    sortValue, setSortValue,
    currentPage,
    filteredList,
    paginatedList,
    totalPages,
    hasActiveFilters,
    resetFilters,
    handlePreviousPage,
    handleNextPage,
    sortOptions,
    statusOptions,
  } = useClearanceTable(list);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Clearance
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            {selected
              ? `Clearance status for AY ${selected.academic_year} · ${selected.semester} semester`
              : "Loading current academic period…"}
          </p>
        </div>
      </div>

      <FiltersBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by dormer name…"
        filters={[
          {
            value: filterValue,
            onValueChange: setFilterValue,
            options: statusOptions,
            placeholder: "Status",
            collapseOnMobile: true,
          },
          {
            value: sortValue,
            onValueChange: setSortValue as (v: string) => void,
            options: sortOptions,
            placeholder: "Sort by",
            collapseOnMobile: false,
          },
        ]}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        resultCount={filteredList.length}
        resultLabel="dormer"
        activeFilterBadges={
          filterValue !== "all"
            ? [{ label: statusOptions.find((o) => o.value === filterValue)?.label ?? filterValue }]
            : []
        }
      />

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
            Dormer Clearance
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Per-dormer outstanding balances and clearance state
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="m-3 sm:m-6 h-64" />
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {hasActiveFilters
                ? "No dormers match your current filters."
                : "No dormers found in this dormitory."}
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Dormer
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Unpaid Bills
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Unpaid Fines
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Outstanding
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((c) => (
                      <TableRow
                        key={c.dormerId}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm">
                          {c.dormerFullName}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {c.unpaidBillsCount} (
                          {formatAmount(c.unpaidBillsTotal)})
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {c.unpaidFinesCount} (
                          {formatAmount(c.unpaidFinesTotal)})
                        </TableCell>
                        <TableCell
                          className={`font-semibold text-xs sm:text-sm ${
                            c.outstandingTotal === 0
                              ? "text-[#2E7D32]"
                              : "text-red-600"
                          }`}
                        >
                          {formatAmount(c.outstandingTotal)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={c.isCleared ? "cleared" : "not-cleared"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
       <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          totalItems={filteredList.length}
          itemLabel="dormer"
        />
    </div>
  );
}
