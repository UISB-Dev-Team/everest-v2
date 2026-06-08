"use client";

import { useMemo, useState, useEffect } from "react";
import type { EventDormerData } from "@/features/events/data";
import { ITEMS_PER_PAGE } from "@/lib/constants/items-per-page";
import { EVENT_DETAIL_SORT_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/constants/sort-options";

export { EVENT_DETAIL_SORT_OPTIONS, PAYMENT_STATUS_OPTIONS };

type SortKey = "name-asc" | "name-desc" | "payment_date-asc" | "payment_date-desc";

function compareDormers(a: EventDormerData, b: EventDormerData, sort: SortKey): number {
  switch (sort) {
    case "name-asc":
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    case "name-desc":
      return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
    case "payment_date-asc": {
      const da = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const db = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      return da - db;
    }
    case "payment_date-desc": {
      const da = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const db = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      return db - da;
    }
    default:
      return 0;
  }
}

export function useEventDormersTable(dormers: EventDormerData[]) {
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortValue, setSortValue]       = useState<SortKey>("name-asc");
  const [currentPage, setCurrentPage]   = useState(1);

  // Reset page when filters/sort change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortValue]);

  const filteredDormers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return dormers
      .filter((d) => {
        const matchesSearch = `${d.first_name ?? ""} ${d.last_name ?? ""}`.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "All" || d.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => compareDormers(a, b, sortValue));
  }, [dormers, searchTerm, statusFilter, sortValue]);

  const totalPages     = Math.max(1, Math.ceil(filteredDormers.length / ITEMS_PER_PAGE));
  const paginatedList  = filteredDormers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "All" || sortValue !== "name-asc";
  const resetFilters = () => { setSearchTerm(""); setStatusFilter("All"); setSortValue("name-asc"); };

  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };
  const handleNextPage     = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };

  return {
    // state
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    sortValue, setSortValue,
    currentPage,
    // derived
    filteredDormers,
    paginatedList,
    totalPages,
    hasActiveFilters,
    resetFilters,
    handlePreviousPage,
    handleNextPage,
    // options (re-exported so the component has no extra import)
    sortOptions: EVENT_DETAIL_SORT_OPTIONS,
    statusOptions: PAYMENT_STATUS_OPTIONS,
  };
}
