"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllEventPayables } from "@/features/events/hooks/useAllEventPayables";
import { useEventsActions } from "@/features/events/hooks/useEventsActions";
import AllEventsDormersTable from "@/features/events/components/admin/all-events-dormers-table";
import EventPayablesModal from "@/features/events/components/admin/event-payables-modal";
import AddEventPaymentModal from "@/features/events/components/admin/add-event-payment-modal";
import type { Event, EventDormerData } from "@/features/events/data";
import { EventPayable } from "../../data/types";
import { Dormer } from "@/features/dormers/data";
import { toast } from "sonner";

export function AdminAllEventsPage() {
  const { payables, loading, refresh } = useAllEventPayables();
  const { recordEventPayment, waiveEventPayable } = useEventsActions();

  const [selectedDormer, setSelectedDormer] = useState<EventPayable | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [isPayablesModalOpen, setIsPayablesModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Update selected dormer if payables data changes (e.g. after a payment)
  useEffect(() => {
    if (selectedDormer) {
      const updated = payables.find(p => p.id === selectedDormer.id);
      if (updated) {
        setSelectedDormer(updated);
      }
    }
  }, [payables]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-96 w-full bg-gray-200" />
      </div>
    );
  }

  const handleLogPayment = async (input: any) => {
    await recordEventPayment({
      event_id: input.event_id,
      dormer_id: input.dormer_id,
      dormitory_id: input.dormitory_id,
      academic_period_id: input.academic_period_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_date: input.payment_date,
      notes: input.notes,
      status: "Paid",
      is_deleted: false,
    });
    
    await refresh();
  };

  const handleWaivePayment = async (dormer: Dormer, event: Event) => {
    if(!dormer || !event) {
      console.error("Missing dormer or event");
      toast.error("Missing dormer or event");
      return;
    };
    await waiveEventPayable(dormer.id, event.id)
    await refresh();
    toast.success(
      `Waved event payable for ${dormer.first_name} ${dormer.last_name} for the specific event`,
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/admin/events">
          <Button
            variant="outline"
            size="sm"
            className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
        </Link>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
          All Dormer Event Payables
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[#12372A]">
          Manage and view event payables across all dormers
        </p>
      </div>

      <AllEventsDormersTable
        payables={payables}
        onViewPayables={(dormer) => {
          setSelectedDormer(dormer);
          setIsPayablesModalOpen(true);
        }}
      />

      <EventPayablesModal
        isOpen={isPayablesModalOpen}
        onClose={() => setIsPayablesModalOpen(false)}
        dormer={selectedDormer}
        onRecordPayment={(event) => {
          setSelectedEvent(event);
          setIsPaymentModalOpen(true);
        }}
        onWaivePayment={handleWaivePayment}
      />

      <AddEventPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        dormer={selectedDormer as unknown as EventDormerData}
        event={selectedEvent}
        onSave={handleLogPayment}
      />
    </div>
  );
}
