"use client";

import { useMemo, useState, useEffect } from "react";
import type { ClearanceStatus } from "@/features/clearance/data";
import { ITEMS_PER_PAGE } from "@/lib/constants/items-per-page";
import {
  CLEARANCE_SORT_OPTIONS,
  CLEARANCE_STATUS_OPTIONS,
  buildRoomOptions,
} from "@/lib/constants/sort-options";

export { CLEARANCE_SORT_OPTIONS, CLEARANCE_STATUS_OPTIONS };

type SortKey =
  | "name-asc" | "name-desc"
  | "unpaid_bills-asc" | "unpaid_bills-desc"
  | "unpaid_fines-asc" | "unpaid_fines-desc"
  | "outstanding-asc"  | "outstanding-desc";

function compareRows(a: ClearanceStatus, b: ClearanceStatus, sort: SortKey): number {
  switch (sort) {
    case "name-asc":          return a.dormerFullName.localeCompare(b.dormerFullName);
    case "name-desc":         return b.dormerFullName.localeCompare(a.dormerFullName);
    case "unpaid_bills-asc":  return a.unpaidBillsCount - b.unpaidBillsCount;
    case "unpaid_bills-desc": return b.unpaidBillsCount - a.unpaidBillsCount;
    case "unpaid_fines-asc":  return a.unpaidFinesCount - b.unpaidFinesCount;
    case "unpaid_fines-desc": return b.unpaidFinesCount - a.unpaidFinesCount;
    case "outstanding-asc":   return a.outstandingTotal - b.outstandingTotal;
    case "outstanding-desc":  return b.outstandingTotal - a.outstandingTotal;
    default: return 0;
  }
}

export function useClearanceTable(list: ClearanceStatus[]) {
  const [searchValue, setSearchValue]   = useState("");
  const [filterValue, setFilterValue]   = useState("all");
  const [sortValue, setSortValue]       = useState<SortKey>("outstanding-desc");
  const [currentPage, setCurrentPage]   = useState(1);

  // Reset page when filters/sort change
  useEffect(() => { setCurrentPage(1); }, [searchValue, filterValue, sortValue]);

  const filteredList = useMemo(() => {
    const q = searchValue.toLowerCase().trim();
    return list
      .filter((c) => {
        const matchesSearch = !q || c.dormerFullName.toLowerCase().includes(q);
        const matchesStatus =
          filterValue === "all" ||
          (filterValue === "cleared" && c.isCleared) ||
          (filterValue === "not-cleared" && !c.isCleared);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => compareRows(a, b, sortValue));
  }, [list, searchValue, filterValue, sortValue]);

  const totalPages    = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedList = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = searchValue !== "" || filterValue !== "all";
  const resetFilters = () => { setSearchValue(""); setFilterValue("all"); };

  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };
  const handleNextPage     = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };

  return {
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
    // options
    sortOptions: CLEARANCE_SORT_OPTIONS,
    statusOptions: CLEARANCE_STATUS_OPTIONS,
  };
}
