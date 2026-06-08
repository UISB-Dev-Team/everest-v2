"use client";

import { Filter, Search, X } from "lucide-react";
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
import type { ExpenseWithRecorder } from "@/features/expenses/data";

interface ExpensesFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  paginatedExpenses: ExpenseWithRecorder[];
  filteredExpenses: ExpenseWithRecorder[];
}

export default function ExpensesFilter({
  setSearchTerm,
  setCategoryFilter,
  searchTerm,
  categoryFilter,
  paginatedExpenses,
  filteredExpenses,
}: ExpensesFilterProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, description, or recorded by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base border-gray-300"
              />
            </div>
          </div>

          <div className="w-full md:w-36">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-gray-300 w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || categoryFilter !== "All") && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4 border-gray-300 hover:bg-gray-50 flex-shrink-0 w-full md:w-auto mt-2 md:mt-0"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {paginatedExpenses.length} of {filteredExpenses.length}{" "}
          expenses
        </div>
      </CardContent>
    </Card>
  );
}
