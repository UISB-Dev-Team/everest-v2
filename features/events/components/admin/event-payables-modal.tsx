"use client";

import { CreditCard, CheckCircle, Clock, X, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatAmount, formatDate } from "@/lib/utils/format";
import type { EventPayable, Event } from "@/features/events/data";
import { Dormer } from "@/features/dormers/data";

interface EventPayablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormer: EventPayable | null;
  onRecordPayment: (event: Event) => void;
  onWaivePayment: (dormer: Dormer, event: Event) => void;
}

export default function EventPayablesModal({
  isOpen,
  onClose,
  dormer,
  onRecordPayment,
  onWaivePayment
}: EventPayablesModalProps) {
  if (!dormer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#12372A]">
            Event Payables for {dormer.first_name} {dormer.last_name}
          </DialogTitle>
          <DialogDescription>
            Room {dormer.room_number ?? "—"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Pending Events Section */}
          <div>
            <h3 className="font-semibold text-lg text-red-600 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending Events
            </h3>
            {dormer.pending_payable_events.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No pending events.</p>
            ) : (
              <div className="space-y-3">
                {dormer.pending_payable_events.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg bg-red-50/50">
                    <div>
                      <div className="font-medium text-[#333333]">{event.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Due: {event.due_date ? formatDate(event.due_date) : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                      <div className="font-bold text-red-600 text-lg">
                        {formatAmount(event.amount_due)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-md rounded-md p-1 z-50">
                          <DropdownMenuItem onClick={() => onRecordPayment(event)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#2E7D32] hover:bg-gray-50 rounded cursor-pointer">
                            <CreditCard className="h-4 w-4" />
                            <span>Log Payment</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onWaivePayment(dormer as unknown as Dormer, event)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer font-medium">
                            <X className="h-4 w-4" />
                            <span>Waive Payment</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paid Events Section */}
          <div>
            <h3 className="font-semibold text-lg text-[#2E7D32] mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Paid Events
            </h3>
            {dormer.event_payments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No paid events.</p>
            ) : (
              <div className="space-y-3">
                {dormer.event_payments.filter(p => p.status === "Paid" || p.status === "Waived").map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg bg-green-50/50">
                    <div>
                      <div className="font-medium text-[#333333]">Event Payment</div>
                      <div className={`text-sm mt-1 ${payment.status === "Waived" ? "text-orange-500" : "text-gray-500"}`}>
                        {payment.status === "Waived" ? "Waived on" : "Paid on"} {payment.payment_date ? formatDate(payment.payment_date) : "—"} via {payment.payment_method}
                      </div>
                    </div>
                    <div className="font-bold text-[#2E7D32] text-lg">
                      {formatAmount(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
