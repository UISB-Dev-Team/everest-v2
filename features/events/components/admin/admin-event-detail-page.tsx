"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { useEventDetail } from "@/features/events/hooks/useEventDetail";
import { useEventsActions } from "@/features/events/hooks/useEventsActions";
import EventDormersTable from "@/features/events/components/admin/event-dormers-table";
import AddEventPaymentModal from "@/features/events/components/admin/add-event-payment-modal";
import type { EventDormerData } from "@/features/events/data";
import { toast } from "sonner";
import { Dormer } from "@/features/dormers/data";

export function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id ?? null;

  const { event, dormers, loading, refresh } = useEventDetail(eventId);
  const { recordEventPayment, waiveEventPayable, remindAllDormers } = useEventsActions();

  const [selectedDormer, setSelectedDormer] = useState<EventDormerData | null>(
    null
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleWaivePayment = async (dormer: Dormer) => {
    console.log(dormer)
    await waiveEventPayable(dormer.id, eventId!)
    toast.success(`${dormer?.first_name} ${dormer?.last_name}'s event payable has been waived.`)  
    refresh()
  }
  
  const handleRemindDormers = async () => {
    setIsSendingEmail(true);
    await remindAllDormers(eventId!);
    setIsSendingEmail(false);  
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-32 w-full bg-gray-200" />
        <Skeleton className="h-96 w-full bg-gray-200" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] p-6 space-y-6">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Event not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = dormers.reduce((sum, d) => sum + d.amount_paid, 0);
  const totalDue = event.amount_due * (dormers.length - dormers.filter((d) => d.payment_status === "Waived").length);
  const progressPercentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <Link href="/admin/events">
        <Button
          variant="outline"
          size="sm"
          className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Button>
      </Link>

      <Card className="border-2 border-gray-100 shadow-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#12372A]">
              {event.name}
            </CardTitle>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
          <Button
            onClick={handleRemindDormers}
            disabled={isSendingEmail}
          >
            {isSendingEmail ? "Sending..." : "Remind Dormers"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#A5D6A7]/10 border border-[#A5D6A7]/30">
              <p className="text-xs text-gray-600 mb-1 font-medium">
                Amount per Dormer
              </p>
              <p className="text-xl font-bold text-[#2E7D32]">
                {formatAmount(event.amount_due)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">
                Collected / Due
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {formatAmount(totalPaid)} /{" "}
                <span className="text-sm text-gray-500">
                  {formatAmount(totalDue)}
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">Due Date</p>
              <p className="text-xl font-bold text-[#333333]">
                {event.due_date ? formatDate(event.due_date) : "—"}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#2E7D32] to-[#A5D6A7] h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {Math.round(progressPercentage)}% Collected
          </div>
        </CardContent>
      </Card>

      <EventDormersTable
        dormers={dormers}
        eventAmount={event.amount_due}
        onLogPayment={(d) => {
          setSelectedDormer(d);
          setIsPaymentModalOpen(true);
        }}
        onWaivePayment={(d) => {
          setSelectedDormer(d);
          handleWaivePayment(d);
        }}
      />

      <AddEventPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        dormer={selectedDormer}
        event={event}
        onSave={async (input) => {
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
            is_deleted: false
          });
          await refresh();
        }}
      />
    </div>
  );
}
