"use client";

import { useMemo, useState, useEffect } from "react";
import type { EventPayable } from "@/features/events/data";
import { ITEMS_PER_PAGE } from "@/lib/constants/items-per-page";
import {
  ALL_EVENTS_SORT_OPTIONS,
  PAYABLE_STATUS_OPTIONS,
  buildRoomOptions,
} from "@/lib/constants/sort-options";

export { ALL_EVENTS_SORT_OPTIONS, PAYABLE_STATUS_OPTIONS };

type SortKey =
  | "name-asc" | "name-desc"
  | "amount_paid-asc" | "amount_paid-desc"
  | "pending_amount-asc" | "pending_amount-desc";

function getTotalPaid(p: EventPayable) {
  return p.event_payments.filter((ep) => ep.status === "Paid").reduce((sum, ep) => sum + (ep.amount ?? 0), 0);
}

function comparePayables(a: EventPayable, b: EventPayable, sort: SortKey): number {
  switch (sort) {
    case "name-asc":
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    case "name-desc":
      return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
    case "amount_paid-asc":  return getTotalPaid(a) - getTotalPaid(b);
    case "amount_paid-desc": return getTotalPaid(b) - getTotalPaid(a);
    case "pending_amount-asc":  return a.pending_payable_amount - b.pending_payable_amount;
    case "pending_amount-desc": return b.pending_payable_amount - a.pending_payable_amount;
    default: return 0;
  }
}

export function useAllEventsDormersTable(payables: EventPayable[]) {
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roomFilter, setRoomFilter]     = useState("All");
  const [sortValue, setSortValue]       = useState<SortKey>("name-asc");
  const [currentPage, setCurrentPage]   = useState(1);

  // Derive unique rooms from actual data
  const roomOptions = useMemo(() => {
    const rooms = [...new Set(payables.map((p) => p.room_number).filter(Boolean) as string[])].sort();
    return buildRoomOptions(rooms);
  }, [payables]);

  // Reset page when filters/sort change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, roomFilter, sortValue]);

  const filteredPayables = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return payables
      .filter((p) => {
        const matchesSearch = `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase().includes(q);
        const isCleared     = p.pending_payable_events.length === 0;
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "cleared" && isCleared) ||
          (statusFilter === "pending" && !isCleared);
        const matchesRoom = roomFilter === "All" || p.room_number === roomFilter;
        return matchesSearch && matchesStatus && matchesRoom;
      })
      .sort((a, b) => comparePayables(a, b, sortValue));
  }, [payables, searchTerm, statusFilter, roomFilter, sortValue]);

  const totalPages    = Math.max(1, Math.ceil(filteredPayables.length / ITEMS_PER_PAGE));
  const paginatedList = filteredPayables.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "All" || roomFilter !== "All" || sortValue !== "name-asc";
  const resetFilters = () => { setSearchTerm(""); setStatusFilter("All"); setRoomFilter("All"); setSortValue("name-asc"); };

  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };
  const handleNextPage     = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    roomFilter, setRoomFilter,
    sortValue, setSortValue,
    currentPage,
    filteredPayables,
    paginatedList,
    totalPages,
    hasActiveFilters,
    resetFilters,
    handlePreviousPage,
    handleNextPage,
    // options
    sortOptions: ALL_EVENTS_SORT_OPTIONS,
    statusOptions: PAYABLE_STATUS_OPTIONS,
    roomOptions,
  };
}
