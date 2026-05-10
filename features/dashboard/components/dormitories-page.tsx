"use client";

import { Building } from "lucide-react";
import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tables } from "@/database.types";

type Dormitory = Tables<"dormitories">;

export function DormitoriesPage() {
  const dormitories = (dormitoriesFixture as Dormitory[]).filter(
    (d) => !d.is_deleted
  );

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
            Dormitories
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-700 mt-1 sm:mt-1.5">
            Registered dormitories on the platform
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-zinc-900">
            Buildings
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Capacity and location of every dormitory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {dormitories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-3 sm:px-4">
              <div className="p-4 rounded-full bg-zinc-100 mb-3">
                <Building className="h-10 w-10 text-zinc-700" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                No dormitories registered
              </h3>
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Name
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Location
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm text-right">
                        Capacity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dormitories.map((d) => (
                      <TableRow
                        key={d.id}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-zinc-900 text-xs sm:text-sm">
                          {d.name}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs sm:text-sm">
                          {d.location ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-zinc-900 text-xs sm:text-sm">
                          {d.capacity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
