"use client";

import { Edit, Eye, FileText, Search, Trash, Users, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Dormer, DormerWithBills } from "@/features/dormers/data";

interface DormersTableProps {
  dormers: DormerWithBills[];
  onGenerateBill: (dormer: DormerWithBills) => void;
  onViewBills: (dormer: DormerWithBills) => void;
  onDelete: (dormer: DormerWithBills) => void;
  onEdit: (dormer: DormerWithBills) => void;
  hasFilters?: boolean;
  onResetFilters?: () => void;
}

export default function DormersTable({
  dormers,
  onGenerateBill,
  onViewBills,
  onDelete,
  onEdit,
  hasFilters = false,
  onResetFilters,
}: DormersTableProps) {
  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-xl md:text-2xl font-bold text-[#12372A]">
          Dormer Records
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Complete list of all registered dormers
        </p>
      </CardHeader>
      <CardContent className="px-5 py-0">
        {dormers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#A5D6A7]/20 rounded-full blur-2xl" />
              <div className="relative p-6 rounded-full bg-[#2E7D32]">
                {hasFilters ? (
                  <Search className="h-12 w-12 text-white" />
                ) : (
                  <Users className="h-12 w-12 text-white" />
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#333333] mb-2">
              {hasFilters ? "No dormers found" : "No dormers yet"}
            </h3>

            <p className="text-sm text-gray-600 text-center max-w-md mb-6">
              {hasFilters
                ? "We couldn't find any dormers matching your search criteria. Try adjusting your filters or search terms."
                : "Get started by adding your first dormer to the system. Click the 'Add Dormer' button to begin."}
            </p>

            {hasFilters && onResetFilters && (
              <Button
                onClick={onResetFilters}
                className="bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f5f5f5] hover:bg-[#f5f5f5]">
                  <TableHead className="font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                    Resident
                  </TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                    Room
                  </TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                    Email
                  </TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                    Phone
                  </TableHead>
                  <TableHead className="text-right font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dormers.map((dormer) => (
                  <TableRow
                    className="hover:bg-[#fafafa] transition-colors border-b border-gray-100"
                    key={dormer.id}
                  >
                    <TableCell className="font-medium w-[30%]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-[#A5D6A7] flex-shrink-0">
                          <AvatarFallback className="bg-[#A5D6A7] text-[#2E7D32] font-semibold">
                            {dormer.first_name?.[0] ?? ""}
                            {dormer.last_name?.[0] ?? ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-semibold text-[#333333] min-w-[200px] max-w-[250px] truncate"
                            title={`${dormer.first_name} ${dormer.last_name}`}
                          >
                            {dormer.first_name} {dormer.last_name}
                          </div>
                          <div
                            className="text-xs text-gray-500 md:hidden min-w-[200px] max-w-[250px] truncate"
                            title={dormer.email}
                          >
                            {dormer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-[#2E7D32] w-[105px]">
                      {dormer.room_number ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600 max-w-[200px] truncate">
                      <div className="truncate" title={dormer.email}>
                        {dormer.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-600">
                      {dormer.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-right w-[80px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-md rounded-md p-1">
                          <DropdownMenuItem onClick={() => onGenerateBill(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#2E7D32] hover:bg-gray-50 rounded cursor-pointer">
                            <FileText className="h-4 w-4" />
                            <span>Generate Bill</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewBills(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-gray-50 rounded cursor-pointer">
                            <Eye className="h-4 w-4" />
                            <span>View Bills</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                            <Edit className="h-4 w-4" />
                            <span>Edit Resident</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer font-medium">
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
