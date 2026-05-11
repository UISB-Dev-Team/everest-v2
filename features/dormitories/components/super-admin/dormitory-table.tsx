"use client";

import { Edit2, MapPin, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DormitoryWithStats } from "@/features/dormitories/data";

interface DormitoryTableProps {
  dorms: DormitoryWithStats[];
  editDormitory: (dorm: DormitoryWithStats) => void;
  deleteDormitory: (dorm: DormitoryWithStats) => void;
}

export default function DormitoryTable({
  dorms,
  editDormitory,
  deleteDormitory,
}: DormitoryTableProps) {
  return (
    <main className="p-0">
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="w-[250px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Dormitory Name
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Location
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Assigned Adviser
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Occupancy
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Capacity
              </TableHead>
              <TableHead className="w-[120px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dorms.map((dorm) => {
              const initials = dorm.adviser_full_name
                ? dorm.adviser_full_name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "—";
              return (
                <TableRow
                  key={dorm.id}
                  className="hover:bg-neutral-50 transition-colors border-neutral-100"
                >
                  <TableCell className="font-medium text-[15px] text-neutral-900">
                    {dorm.name}
                  </TableCell>
                  <TableCell className="text-[14px]">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      {dorm.location ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 border border-neutral-200">
                        <AvatarFallback className="bg-neutral-900 text-white text-[10px] font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[14px] font-medium text-neutral-700">
                        {dorm.adviser_full_name ?? "Unassigned"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px]">
                    <span className="text-neutral-600 font-medium">
                      {dorm.occupancy}
                    </span>
                    <span className="text-neutral-400 ml-1 text-xs">
                      ({dorm.occupancy_percentage}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-[14px]">
                    <span className="text-neutral-600 font-medium">
                      {dorm.capacity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right align-middle w-[120px]">
                    <div className="flex justify-end items-center h-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            className="text-xs font-medium py-2 cursor-pointer"
                            onClick={() => editDormitory(dorm)}
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs font-medium py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => deleteDormitory(dorm)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Remove Dorm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {dorms.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-gray-400 text-4xl">🏢</div>
                    <div className="text-gray-500 text-lg font-medium">
                      No dormitories found
                    </div>
                    <div className="text-gray-400 text-sm">
                      No dormitories have been added yet.
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
