"use client";

import { useEffect, useState } from "react";
import { CreditCard, FileText, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/shared";
import { finesData } from "@/features/fines/data";
import type {
  FineImpositionWithCategory,
} from "@/features/fines/data";
import type { Dormer } from "@/features/dormers/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FinesPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The dormer whose fines are being managed. */
  dormer: Dormer | null;
  /** Called after a payment is successfully submitted so the parent can refresh. */
  onPaymentRecorded?: () => void;
  /** Passed-through from useFinesActions so the modal can call recordFinePayment. */
  recordFinePayment: (
    id: string,
    amount: number,
    paymentMethod: string
  ) => Promise<void>;
  isSubmitting: boolean;
}

type PaymentView = { fine: FineImpositionWithCategory } | null;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FinesPaymentModal({
  isOpen,
  onClose,
  dormer,
  onPaymentRecorded,
  recordFinePayment,
  isSubmitting,
}: FinesPaymentModalProps) {
  const [impositions, setImpositions] = useState<FineImpositionWithCategory[]>(
    []
  );
  const {selected} = useAcademicPeriod();
  const [loadingImpositions, setLoadingImpositions] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Payment sub-form state
  const [paymentView, setPaymentView] = useState<PaymentView>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // ---------------------------------------------------------------------------
  // Load impositions whenever the modal opens for a dormer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !dormer?.id || !selected?.id) {
      setImpositions([]);
      setPaymentView(null);
      return;
    }

    let cancelled = false;
    setLoadingImpositions(true);
    setFetchError(null);

    finesData
      .listImpositionsForDormer(dormer.id, selected?.id!)
      .then((data) => {
        if (!cancelled) setImpositions(data);
      })
      .catch((err) => {
        if (!cancelled)
          setFetchError(err?.message ?? "Failed to load fines. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingImpositions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, dormer?.id]);

  // ---------------------------------------------------------------------------
  // Reset payment form when a new fine row is selected
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (paymentView) {
      const today = new Date().toISOString().split("T")[0];
      setPaymentAmount("");
      setPaymentMethod("Cash");
      setPaymentDate(today);
      setPaymentNotes("");
    }
  }, [paymentView]);

  // ---------------------------------------------------------------------------
  // Guard: nothing to render without a dormer
  // ---------------------------------------------------------------------------
  if (!dormer) return null;

  const initials = `${dormer.first_name?.[0] ?? ""}${dormer.last_name?.[0] ?? ""}`.toUpperCase();

  const totalDue = impositions.reduce((s, i) => s + i.amount, 0);
  const totalPaid = impositions.reduce((s, i) => s + (i.amount_paid ?? 0), 0);
  const balance = totalDue - totalPaid;
  const unpaidCount = impositions.filter((i) => i.status === "Unpaid").length;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOpenPayment = (fine: FineImpositionWithCategory) => {
    setPaymentView({ fine });
  };

  const handleCancelPayment = () => {
    setPaymentView(null);
  };

  const handleConfirmPayment = async () => {
    if (!paymentView) return;
    const parsed = parseFloat(paymentAmount);
    if (!parsed || parsed <= 0) return;

    await recordFinePayment(paymentView.fine.id, parsed, paymentMethod);

    // Optimistically update the local list
    setImpositions((prev) =>
      prev.map((imp) => {
        if (imp.id !== paymentView.fine.id) return imp;
        const newPaid = (imp.amount_paid ?? 0) + parsed;
        return {
          ...imp,
          amount_paid: newPaid,
          status: newPaid >= imp.amount ? "Paid" : "Unpaid",
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
        };
      })
    );

    setPaymentView(null);
    onPaymentRecorded?.();
  };

  const handleClose = () => {
    setPaymentView(null);
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const remainingBalance = paymentView
    ? paymentView.fine.amount - (paymentView.fine.amount_paid ?? 0)
    : 0;

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-red-200">
              <AvatarFallback className="bg-red-100 text-red-800 font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base font-bold text-[#12372A]">
                {dormer.first_name} {dormer.last_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Room {dormer.room_number ?? "—"} • {unpaidCount} unpaid fine
                {unpaidCount !== 1 ? "s" : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ---------------------------------------------------------------- */}
        {/* Summary Tiles                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label="Total Due" value={formatAmount(totalDue)} tone="neutral" />
          <SummaryTile label="Total Paid" value={formatAmount(totalPaid)} tone="positive" />
          <SummaryTile
            label="Balance"
            value={formatAmount(balance)}
            tone={balance === 0 ? "positive" : "danger"}
          />
        </div>

        <Separator />

        {/* ---------------------------------------------------------------- */}
        {/* Body                                                              */}
        {/* ---------------------------------------------------------------- */}
        {loadingImpositions ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#2E7D32]" />
            <p className="text-sm">Loading fines…</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-red-600">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm text-center">{fetchError}</p>
          </div>
        ) : impositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
            <div className="p-4 rounded-full bg-gray-100">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No fines on record</p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              This dormer has no fine impositions yet. Use the &ldquo;Fine&rdquo; button on
              the table to generate one.
            </p>
          </div>
        ) : paymentView ? (
          /* -------------------------------------------------------------- */
          /* Payment sub-form                                                */
          /* -------------------------------------------------------------- */
          <div className="space-y-4">
            {/* Fine summary card */}
            <Card className="bg-gray-50 border border-gray-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fine Summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-gray-400">Fine ID</Label>
                    <p className="font-mono font-semibold text-[#12372A]">
                      {paymentView.fine.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Remaining Balance</Label>
                    <p className="font-bold text-red-600">
                      {formatAmount(remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Total Amount</Label>
                    <p>{formatAmount(paymentView.fine.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Amount Paid</Label>
                    <p>{formatAmount(paymentView.fine.amount_paid ?? 0)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-400">Category</Label>
                    <p className="font-medium">{paymentView.fine.category_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment inputs */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="fpm-amount">Payment Amount</Label>
                <Input
                  id="fpm-amount"
                  type="number"
                  placeholder={`e.g., ${remainingBalance.toFixed(2)}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1"
                  min={0.01}
                  max={remainingBalance}
                  step={0.01}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fpm-date">Payment Date</Label>
                  <Input
                    id="fpm-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fpm-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="fpm-method" className="mt-1">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="GCash">GCash</SelectItem>
                      <SelectItem value="PayMaya">PayMaya (Maya)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fpm-notes">
                  Notes (Optional){" "}
                  <span className="text-xs text-gray-400">
                    ({paymentNotes.length}/500)
                  </span>
                </Label>
                <Textarea
                  id="fpm-notes"
                  placeholder="e.g., Payment for property damage fine"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  maxLength={500}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ) : (
          /* -------------------------------------------------------------- */
          /* Impositions list                                                */
          /* -------------------------------------------------------------- */
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-[#12372A] text-xs">Date</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs">Category</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs">Amount</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs">Paid</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs">Balance</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-[#12372A] text-xs text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impositions.map((fine) => {
                  const bal = Math.max(0, fine.amount - (fine.amount_paid ?? 0));
                  const isPaid = fine.status === "Paid";
                  return (
                    <TableRow
                      key={fine.id}
                      className="hover:bg-[#f0f0f0] transition-colors text-sm"
                    >
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(fine.date_imposed)}
                      </TableCell>
                      <TableCell className="font-medium text-[#333333] text-xs">
                        {fine.category_name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-700">
                        {formatAmount(fine.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-[#2E7D32] font-semibold">
                        {formatAmount(fine.amount_paid ?? 0)}
                      </TableCell>
                      <TableCell
                        className={`text-xs font-semibold ${
                          bal === 0 ? "text-[#2E7D32]" : "text-red-600"
                        }`}
                      >
                        {formatAmount(bal)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fine.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {!isPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all"
                            onClick={() => handleOpenPayment(fine)}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-50 text-green-700 border border-green-200"
                          >
                            Settled
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                            */}
        {/* ---------------------------------------------------------------- */}
        <DialogFooter className="gap-2">
          {paymentView ? (
            <>
              <Button variant="outline" onClick={handleCancelPayment} disabled={isSubmitting}>
                Back
              </Button>
              <Button
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                onClick={handleConfirmPayment}
                disabled={
                  isSubmitting ||
                  !paymentAmount ||
                  parseFloat(paymentAmount) <= 0 ||
                  parseFloat(paymentAmount) > remainingBalance
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing…
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Local SummaryTile (self-contained so no extra shared-component dep)
// ---------------------------------------------------------------------------

interface SummaryTileProps {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "danger";
}

function SummaryTile({ label, value, tone }: SummaryTileProps) {
  const valueClass =
    tone === "positive"
      ? "text-[#2E7D32]"
      : tone === "danger"
      ? "text-red-600"
      : "text-[#12372A]";

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
