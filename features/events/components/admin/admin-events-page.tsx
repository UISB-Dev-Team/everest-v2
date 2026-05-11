"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventsData } from "@/features/events/hooks/useEventsData";
import { useEventsActions } from "@/features/events/hooks/useEventsActions";
import AddEventModal, {
  type AddEventInput,
} from "@/features/events/components/admin/add-event-modal";

export function AdminEventsPage() {
  const { loading, eventsWithStats, refresh } = useEventsData();
  const { handleSaveEvent } = useEventsActions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-200" />
            <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 bg-gray-200" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-40 bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="border-2 border-gray-100 shadow-md bg-white"
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-5 sm:h-6 w-3/4 bg-gray-200" />
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Skeleton className="h-3 sm:h-4 w-full bg-gray-200" />
                <Skeleton className="h-2 w-full bg-gray-200" />
                <Skeleton className="h-8 sm:h-9 w-full bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleSave = async (input: AddEventInput) => {
    await handleSaveEvent(input);
    await refresh();
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Event Payables
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A]">
            Manage one-time payables separate from the main dorm fund
          </p>
        </div>
        <Button
          className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold transition-all text-xs sm:text-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
          Create New Event
        </Button>
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />

      {eventsWithStats.length === 0 ? (
        <Card className="border-2 border-gray-100 shadow-md bg-white">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#333333] mb-2">
                No events created yet
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 text-center max-w-md mb-4 sm:mb-6">
                Create your first event to start tracking one-time payables
                separate from regular dorm fees.
              </p>

              <Button
                className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold transition-all text-xs sm:text-sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                Create First Event
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {eventsWithStats.map((event) => (
            <Card
              key={event.id}
              className="border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-white group"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-bold text-[#12372A] group-hover:text-[#2E7D32] transition-colors line-clamp-2">
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Amount Due:
                  </span>
                  <span className="font-bold text-lg sm:text-xl text-[#2E7D32]">
                    ₱{event.amount_due.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium">
                      Collection Progress:
                    </span>
                    <span className="font-semibold text-[#333333]">
                      {event.paidCount}/{event.dormerTotal} Paid
                    </span>
                  </div>
                  <Progress value={event.progressPercentage} className="h-2" />
                  <div className="text-xs text-gray-500 text-center font-medium">
                    {Math.round(event.progressPercentage)}% Complete
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center mt-3">
                    <div className="py-1.5 px-1.5 sm:px-2 rounded-lg bg-[#A5D6A7]/20">
                      <span className="font-bold text-sm sm:text-base text-[#2E7D32]">
                        {event.paidCount}
                      </span>
                      <span className="text-gray-600 block text-[10px] sm:text-xs">
                        Paid
                      </span>
                    </div>
                    <div className="py-1.5 px-1.5 sm:px-2 rounded-lg bg-yellow-50">
                      <span className="font-bold text-sm sm:text-base text-yellow-700">
                        {event.partialCount}
                      </span>
                      <span className="text-gray-600 block text-[10px] sm:text-xs">
                        Partial
                      </span>
                    </div>
                    <div className="py-1.5 px-1.5 sm:px-2 rounded-lg bg-red-50">
                      <span className="font-bold text-sm sm:text-base text-red-600">
                        {event.unpaidCount}
                      </span>
                      <span className="text-gray-600 block text-[10px] sm:text-xs">
                        Unpaid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-2">
                  <Link href={`/admin/events/${event.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLoadingEventId(event.id)}
                      disabled={loadingEventId === event.id}
                      className="flex w-full border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all font-semibold text-xs sm:text-sm touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingEventId === event.id ? (
                        <>
                          <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          View Details
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
