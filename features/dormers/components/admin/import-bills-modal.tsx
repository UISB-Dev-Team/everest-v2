"use client";

import { useState, useRef } from "react";
import { parseCsv, readCsvFile } from "@/lib/csv/parse-csv";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Info, Download, AlertCircle } from "lucide-react";
import { RegularCharge } from "@/features/regular-charges/data";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { ImportedBill, DormerWithBills } from "../../data";



export interface ImportBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (bills: ImportedBill[], payable: RegularCharge | null) => Promise<{ successCount: number; errorCount: number; errors: string[] }>;
  isSubmitting: boolean;
  payables: RegularCharge[];
  billingPeriods: string[]; // raw values e.g. ["2026-01", "1st-semester (2025-2026)"]
  dormers: DormerWithBills[];
}
export default function ImportBillsModal({
  isOpen,
  onClose,
  onImport,
  isSubmitting,
  payables,
  billingPeriods,
  dormers,
}: ImportBillsModalProps) {
  const billingPeriodLabels = billingPeriods.map(getBillingPeriodLabel);
  const [csvText, setCsvText] = useState("");
  const [selectedPayable, setSelectedPayable] = useState<RegularCharge | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCounts = (text: string) => {
    const { headers, rows } = parseCsv(text);
    const hasHeader = headers.length > 0 && headers[0].toLowerCase() === "email";
    setRowCount(hasHeader ? rows.length : Math.max(0, rows.length - 1));
    let estimated = 0;
    rows.forEach((cells) => {
      if (cells.length > 3) {
        estimated += cells.slice(3).filter((c) => c.trim()).length;
      }
    });
    setBillCount(estimated);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    updateCounts(text);
  };

  const parseBillsCSV = (text: string, selectedPayable: RegularCharge | null) => {
    const errors: string[] = [];

    if (!selectedPayable) {
      errors.push("Please select a payable type before importing.");
      return { bills: [], errors };
    }

    const { headers, rows } = parseCsv(text);

    if (headers.length === 0 || rows.length === 0) {
      errors.push("Invalid CSV format: File must contain at least a header row and one data row.");
      return { bills: [], errors };
    }

    if (headers.length < 4) {
      errors.push("Invalid CSV format: Must have at least 4 columns (Email, First Name, Last Name, and billing period columns).");
      return { bills: [], errors };
    }

    if (
      headers[0].toLowerCase() !== "email" ||
      headers[1].toLowerCase() !== "first name" ||
      headers[2].toLowerCase() !== "last name"
    ) {
      errors.push(
        `Invalid CSV headers: First three columns must be "Email", "First Name", "Last Name". Found: "${headers[0]}", "${headers[1]}", "${headers[2]}".`
      );
      return { bills: [], errors };
    }

    // Validate billing period column headers (columns 4+)
    const periodHeaders = headers.slice(3);
    if (periodHeaders.length === 0) {
      errors.push("No billing period columns found. Please include at least one billing period column.");
      return { bills: [], errors };
    }

    for (let j = 0; j < periodHeaders.length; j++) {
      const period = periodHeaders[j];
      if (!period) {
        errors.push(`Column ${j + 4}: Billing period header is empty.`);
      } else if (!billingPeriodLabels.includes(period)) {
        errors.push(`Column ${j + 4}: Invalid billing period "${period}".`);
      }
    }

    // Pre-build label → raw value map once
    const labelToValue = new Map(
      billingPeriods.map((v) => [getBillingPeriodLabel(v), v])
    );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const bills: ImportedBill[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // +2: 1-indexed, header is row 1
      const parts = rows[i];

      if (parts.length < 4) {
        errors.push(
          `Row ${rowNumber}: Insufficient columns. Expected at least 4, found ${parts.length}.`
        );
        continue;
      }

      const [email, firstName, lastName] = parts;

      if (!email || !firstName || !lastName) {
        errors.push(`Row ${rowNumber}: Email, First Name, and Last Name are all required.`);
        continue;
      }

      if (!emailRegex.test(email)) {
        errors.push(`Row ${rowNumber}: Invalid email format "${email}".`);
        continue;
      }

      // A cell with any non-empty value triggers a bill for that period
      for (let j = 3; j < parts.length && j < headers.length; j++) {
        const value = parts[j];
        if (!value) continue;

        const periodLabel = headers[j];
        const billingPeriodValue = labelToValue.get(periodLabel);
        if (!billingPeriodValue) {
          errors.push(`Row ${rowNumber}: Could not map billing period "${periodLabel}" to a valid value.`);
          continue;
        }

        bills.push({
          email,
          first_name: firstName,
          last_name: lastName,
          billing_month: billingPeriodValue,
          rowNumber,
        });
      }
    }

    return { bills, errors };
  };

  const handleImport = async () => {
    const { bills, errors: parsingErrors } = parseBillsCSV(csvText, selectedPayable);

    if (parsingErrors.length > 0) {
      // pass parsing errors to the parent componenet for display in results modal
      const errorBills = parsingErrors.map(error => ({ 
        error, 
        isParsingError: true,
        email: "",
        first_name: "",
        last_name: "",
        billing_month: "",
        rowNumber: 0,
      }));
      const result = await onImport(errorBills, selectedPayable);
      setImportResult(result);
      return;
    }

    if (bills.length === 0) {
      toast.error("No bills found to import. Make sure to include non-empty values in billing period columns.");
      return;
    }

    const result = await onImport(bills, selectedPayable);
    setImportResult(result);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readCsvFile(file);
    setCsvText(text);
    updateCounts(text);
  };

  const handleClose = () => {
    setCsvText("");
    setSelectedPayable(null);
    setRowCount(0);
    setBillCount(0);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Headers: Email, First Name, Last Name, then one column per billing period label
    const headers = ["Email", "First Name", "Last Name", ...billingPeriodLabels];

    // One row per active dormer — billing period cells are empty, ready to be filled in
    const dataRows = dormers.map((d) => [
      d.email ?? "",
      d.first_name ?? "",
      d.last_name ?? "",
      ...billingPeriodLabels.map(() => ""),
    ]);

    // Wrap every cell in double-quotes and escape any existing quotes (RFC 4180)
    const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csvContent =
      [headers, ...dataRows]
        .map((row) => row.map(escape).join(","))
        .join("\n");

    // Prepend UTF-8 BOM so Excel on Windows opens it without garbled characters
    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bills-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className={undefined}>
          <DialogTitle className={undefined}>
            Import Bills for Billing Periods
          </DialogTitle>
          <DialogDescription className={undefined}>
            Bulk-create bills for multiple dormers across billing periods.
          </DialogDescription>
        </DialogHeader>

        {importResult ? (
          <div className="py-4 space-y-4">
            <div className={`p-4 rounded-md flex gap-3 ${importResult.successCount > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <Info className={`h-5 w-5 shrink-0 mt-0.5 ${importResult.successCount > 0 ? "text-green-600" : "text-red-600"}`} />
              <div className="text-sm">
                <p className={`font-semibold mb-1 ${importResult.successCount > 0 ? "text-green-800" : "text-red-800"}`}>
                  Import Complete
                </p>
                <div className="space-y-1">
                  <p className="text-green-700">Successfully created: {importResult.successCount} bills</p>
                  {importResult.errorCount > 0 && (
                    <p className="text-red-700">Errors encountered: {importResult.errorCount}</p>
                  )}
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
                <div className="bg-red-50 p-3 rounded-md max-h-48 overflow-y-auto text-xs text-red-700 space-y-1 border border-red-100">
                  {importResult.errors.map((error, idx) => (
                    <div key={idx}>• {error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* ── Step 1: Download template ── */}
            <div className="rounded-lg border-2 border-dashed border-[#2E7D32] bg-green-50 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1B5E20]">Step 1 — Download the template</p>
                <p className="text-xs text-green-800 mt-0.5">
                  Pre-filled with all {dormers.length} current dormers and every supported billing period as a column.
                  Just put <strong>1</strong> in a cell to create a bill, leave it empty to skip.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="shrink-0 border-[#2E7D32] text-[#2E7D32] hover:bg-green-100 font-semibold"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>

            {/* ── Step 2: Upload hint ── */}
            <div className="bg-blue-50 p-3 rounded-md flex gap-2 text-xs text-blue-800">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>Step 2 —</strong> Fill in the template, then upload or paste it below.
                Only cells with a value create a bill — empty cells are ignored.
                Existing <strong>paid</strong> bills will be skipped automatically.
              </p>
            </div>

            {rowCount > 50 && (
              <div className="bg-yellow-50 p-4 rounded-md flex gap-3 border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Large Import Detected ({rowCount} students, ~{billCount} bills)</p>
                  <p className="text-xs">
                    Processing {rowCount} students with approximately {billCount} bills. This might take a while. Consider splitting into smaller batches (50 students each) for better reliability and easier error tracking.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                Select Payable Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                onValueChange={(value) => setSelectedPayable(payables.find(p => p.id === value) || null)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={!selectedPayable ? "border-red-300 focus:ring-red-400" : undefined}>
                  <SelectValue placeholder="Choose a payable type" />
                </SelectTrigger>
                <SelectContent className={undefined}>
                  {payables.map((payable) => (
                    <SelectItem key={payable.id} value={payable.id} className={undefined}>
                      {payable.name} - ₱{payable.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPayable ? (
                <p className="text-xs text-gray-500 mt-1">
                  All imported bills will use ₱{selectedPayable.amount} as the amount due.
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-1">
                  Required — select a payable type before importing.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Paste CSV Data</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs border-dashed"
                  disabled={isSubmitting}
                >
                  <FileUp className="h-3 w-3 mr-2" />
                  Upload File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                />
              </div>
              <Textarea
                placeholder="Email, First Name, Last Name, January 2026, February 2026, March 2026&#10;john.doe@email.com, John, Doe, 1, , 1&#10;jane.smith@email.com, Jane, Smith, 1, 1, 1"
                className="min-h-[200px] font-mono text-xs"
                value={csvText}
                onChange={handleTextChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <DialogFooter className={undefined}>
          {importResult ? (
            <Button onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className={undefined}
                size={undefined}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                onClick={handleImport}
                disabled={!csvText.trim() || !selectedPayable || isSubmitting}
                variant={undefined}
                size={undefined}
              >
                {isSubmitting 
                  ? rowCount > 50 || billCount > 100
                    ? `Creating ~${billCount} bills... This might take a while...`
                    : "Creating bills..."
                  : billCount > 0 
                    ? `Create ~${billCount} Bills` 
                    : "Create Bills"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}