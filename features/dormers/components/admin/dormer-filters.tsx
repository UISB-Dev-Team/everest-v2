"use client";

import { Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MaboloRoomNumber,
  SampaguitaRoomNumber,
} from "@/lib/constants/room-numbers";
import { useDormitory } from "@/lib/hooks/useDormitory";

interface DormerFiltersProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  count: number;
  resetFilter: () => void;
}

export default function DormerFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  count,
  resetFilter,
}: DormerFiltersProps) {
  const hasActiveFilters = searchTerm || statusFilter !== "All";
  const dormitory = useDormitory();
  const isMabolo = dormitory?.dormitoryName?.toLowerCase().includes("mabolo");

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Search dormers..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="pl-9 sm:pl-10 border-gray-300 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="border-gray-300 h-9 sm:h-10 w-10 sm:w-auto px-1 py-1 sm:px-3 gap-0 sm:gap-2">
                  <div className="flex items-center justify-center sm:justify-start w-full">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline sm:ml-2">
                      <SelectValue placeholder="Filter by room" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Rooms</SelectItem>
                  {(isMabolo ? MaboloRoomNumber : SampaguitaRoomNumber).map(
                    (room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                onClick={resetFilter}
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4 border-gray-300 hover:bg-gray-50 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {count} dormer{count !== 1 ? "s" : ""}
            </div>
            {statusFilter !== "All" && (
              <Badge
                variant="secondary"
                className="text-xs bg-[#A5D6A7]/20 text-[#2E7D32] hover:bg-[#A5D6A7]/30"
              >
                {statusFilter === "SA Room"
                  ? "SA Room"
                  : `Room ${statusFilter}`}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
