"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dormersData } from "@/features/dormers/data";
import { FineCategory, finesData } from "@/features/fines/data";
import type { Dormer } from "@/features/dormers/data";
import type {
  FineImpositionWithCategory,
  FineStatistics,
} from "@/features/fines/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useRooms } from "@/lib/hooks/useRooms";
import {
  FINES_ADMIN_SORT_OPTIONS,
  FINES_STATUS_OPTIONS,
  buildRoomOptions,
} from "@/lib/constants/sort-options";

/**
 * Mirrors the old admin-side `useFinesData` hook surface but uses the seam.
 * Returns dormers + impositions for the active dormitory, applies search and
 * status filters, paginates, and provides aggregate statistics.
 */
export function useFinesAdminData() {
  const { dormitoryId } = useDormitory();
  const { selected } = useAcademicPeriod();
  const { roomNumbers } = useRooms();
  const [dormers, setDormers] = useState<Dormer[]>([]);
  const [fines, setFines] = useState<FineCategory[]>([])
  const [impositions, setImpositions] = useState<FineImpositionWithCategory[]>(
    []
  );
  const [statistics, setStatistics] = useState<FineStatistics>({
    totalFines: 0,
    collectedFines: 0,
    collectibleFines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [roomFilter, setRoomFilter] = useState("All");
  const [sortValue, setSortValue] = useState<"name-asc" | "name-desc">("name-asc");
  const itemsPerPage = 6;

  useEffect(() => {
    if (!dormitoryId || !selected?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dormersData.listForDormitory(dormitoryId, selected?.id!),
      finesData.listImpositionsForDormitory(dormitoryId, selected?.id!),
      finesData.statisticsForDormitory(dormitoryId, selected?.id!),
      finesData.listCategoriesForDormitory(dormitoryId, selected?.id!),
    ])
      .then(([d, i, s, f]) => {
        if (cancelled) return;
        setDormers(d);
        setImpositions(i);
        setStatistics(s);
        setFines(f);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };

  }, [dormitoryId, selected?.id]);

  const filteredDormers = useMemo(() => {
    const filtered = dormers.filter((dormer) => {
      const matchesSearch = `${dormer.first_name} ${dormer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRoom = roomFilter === "All" || dormer.room_number === roomFilter;
      if (statusFilter === "All") return matchesSearch && matchesRoom;
      const own = impositions.filter((i) => i.dormer_id === dormer.id);
      const hasUnpaid = own.some((i) => i.amount_paid < i.amount);
      const hasPaid = own.some((i) => i.status === "Paid");
      if (statusFilter === "Unpaid") return matchesSearch && hasUnpaid && matchesRoom;
      if (statusFilter === "Paid")
        return matchesSearch && hasPaid && !hasUnpaid && matchesRoom;
      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`;
      const nameB = `${b.first_name} ${b.last_name}`;
      if (sortValue === "name-asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [dormers, impositions, searchTerm, statusFilter, roomFilter, sortValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDormers.length / itemsPerPage)
  );
  const paginatedDormers = filteredDormers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roomFilter, sortValue]);

  const roomOptions = useMemo(() => {
    return buildRoomOptions(roomNumbers);
  }, [roomNumbers]);

  return {
    dormers,
    fines,
    impositions,
    statistics,
    loading,
    paginatedDormers,
    filteredDormers,
    rooms: roomNumbers,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roomFilter,
    setRoomFilter,
    sortValue,
    setSortValue,
    handleNextPage,
    handlePreviousPage,
    dormitoryId,
    sortOptions: FINES_ADMIN_SORT_OPTIONS,
    statusOptions: FINES_STATUS_OPTIONS,
    roomOptions,
  };
}
