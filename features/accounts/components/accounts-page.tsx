"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import AccountsTable from "./accounts-table";
import type { AccountUser } from "@/features/accounts/actions/user-actions";
import { toggleUserStatus } from "@/features/accounts/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

interface AccountsPageProps {
  initialUsers: AccountUser[];
}

export default function AccountsPage({ initialUsers }: AccountsPageProps) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");

  const filteredUsers = useMemo(
    () =>
      initialUsers.filter((u) =>
        u.email.toLowerCase().includes(committedSearch.toLowerCase())
      ),
    [initialUsers, committedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  // Clamp page when filter shrinks the result set
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = () => {
    setCommittedSearch(searchEmail);
    setCurrentPage(1);
  };

  const handleToggleStatus = (userId: string, isBanned: boolean) => {
    startTransition(async () => {
      try {
        await toggleUserStatus(userId, isBanned);
      } catch (error) {
        console.error("Failed to toggle status:", error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            Super Admin
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Account Registry
        </h1>
        <p className="text-[15px] text-neutral-500 mt-1 font-normal">
          Manage all user accounts
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <AccountsTable
        users={paginatedUsers}
        onToggleStatus={handleToggleStatus}
        isPending={isPending}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}