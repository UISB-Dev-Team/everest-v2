"use client";

import { Ban, Calendar, CheckCircle2, MoreHorizontal, UserX } from "lucide-react";
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
import type { AccountUser } from "@/features/accounts/actions/user-actions";

interface AccountsTableProps {
  users: AccountUser[];
  onToggleStatus: (userId: string, isBanned: boolean) => void;
  isPending: boolean;
}

export default function AccountsTable({
  users,
  onToggleStatus,
  isPending,
}: AccountsTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="p-0">
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="w-[300px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Account Email
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Joined Date
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Last Sign In
              </TableHead>
              <TableHead className="w-[120px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Status
              </TableHead>
              <TableHead className="w-[120px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              return (
                <TableRow
                  key={user.id}
                  className="hover:bg-neutral-50 transition-colors border-neutral-100"
                >
                  <TableCell className="font-medium text-[15px] text-neutral-900">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-[14px] text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {formatDate(user.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px] text-neutral-600">
                    {user.last_sign_in_at ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        {formatDate(user.last_sign_in_at)}
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Never signed in</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!user.is_banned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 gap-1.5">
                        <Ban className="h-3 w-3" />
                        Disabled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right align-middle w-[120px]">
                    <div className="flex justify-end items-center h-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          {user.is_banned ? (
                            <DropdownMenuItem
                              className="text-xs font-medium py-2 cursor-pointer text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
                              onClick={() => onToggleStatus(user.id, user.is_banned)}
                              disabled={isPending}
                            >
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                              Enable Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-xs font-medium py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => onToggleStatus(user.id, user.is_banned)}
                              disabled={isPending}
                            >
                              <UserX className="mr-2 h-3.5 w-3.5" />
                              Disable Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-gray-400 text-4xl">👥</div>
                    <div className="text-gray-500 text-lg font-medium">
                      No accounts found
                    </div>
                    <div className="text-gray-400 text-sm">
                      There are no registered user accounts.
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
