"use client";

import { Edit2, Mail, MoreHorizontal, Phone, Trash2 } from "lucide-react";
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
import type { Adviser } from "@/features/advisers/data";

interface AdvisersTableProps {
  advisers: Adviser[];
  onEdit: (adviser: Adviser) => void;
  onDelete: (adviser: Adviser) => void;
}

export default function AdvisersTable({
  advisers,
  onEdit,
  onDelete,
}: AdvisersTableProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[250px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
              Name
            </TableHead>
            <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
              Contact Info
            </TableHead>
            <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
              Role · Dormitory
            </TableHead>
            <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advisers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No advisers found.
              </TableCell>
            </TableRow>
          ) : (
            advisers.map((adviser) => (
              <TableRow
                key={adviser.role_id}
                className="hover:bg-neutral-50 transition-colors border-neutral-100"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-neutral-200">
                      <AvatarFallback className="bg-neutral-900 text-white text-xs font-medium">
                        {adviser.first_name?.[0] ?? ""}
                        {adviser.last_name?.[0] ?? ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-neutral-900">
                        {adviser.first_name} {adviser.last_name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {adviser.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {adviser.phone ?? "—"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-900 capitalize">
                      {adviser.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {adviser.dormitory_name ?? "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
                        onClick={() => onEdit(adviser)}
                      >
                        <Edit2 className="mr-2 h-3.5 w-3.5" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs font-medium py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => onDelete(adviser)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove Adviser
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
