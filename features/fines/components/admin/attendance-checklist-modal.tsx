"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Zap, Save, Users, AlertCircle } from "lucide-react";
import { Dormer } from "@/features/dormers/data";
import { FineCategory } from "../../data";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "absent" | "unset";

export interface AttendanceDraft {
  date: string;
  fineId: string;
  checks: Record<string, AttendanceStatus>; // dormer.id → status
}

export interface AttendanceSubmitPayload {
  date: string;
  fineId: string;
  absentDormerIds: string[];
}

interface AttendanceChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** All dormers in the dormitory for the current period */
  dormers: Dormer[];
  /** Payable fine categories the SA can pick from */
  payableFines: FineCategory[];
  /** Room numbers fetched from the database (via useRooms) */
  roomNumbers: string[];
  /** Called when SA hits "Generate fines" — parent handles imposeFine loop */
  onSubmit: (payload: AttendanceSubmitPayload) => Promise<void>;
  isSubmitting: boolean;
  /** localStorage key — scope per dormitory so different dorms don't collide */
  cacheKey?: string;
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────

const STORAGE_VERSION = "v1";

function buildCacheKey(base: string) {
  return `dormpay_attendance_draft_${STORAGE_VERSION}_${base}`;
}

function loadDraft(key: string): AttendanceDraft | null {
  try {
    const raw = localStorage.getItem(buildCacheKey(key));
    return raw ? (JSON.parse(raw) as AttendanceDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(key: string, draft: AttendanceDraft) {
  try {
    localStorage.setItem(buildCacheKey(key), JSON.stringify(draft));
  } catch {
    // storage full or unavailable — fail silently
  }
}

function clearDraft(key: string) {
  try {
    localStorage.removeItem(buildCacheKey(key));
  } catch {}
}

// ─── Avatar colour helper ─────────────────────────────────────────────────────

const AVATAR_COLOURS = [
  "bg-blue-100 text-blue-800",
  "bg-teal-100 text-teal-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
];

function avatarColour(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length];
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttendanceChecklistModal({
  isOpen,
  onClose,
  dormers,
  payableFines,
  roomNumbers,
  onSubmit,
  isSubmitting,
  cacheKey = "default",
}: AttendanceChecklistModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedFineId, setSelectedFineId] = useState<string>("");
  const [checks, setChecks] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState("");
  const [hasCachedDraft, setHasCachedDraft] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [room, setRoom] = useState("");

  // ── On open: restore draft for today if available ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const draft = loadDraft(cacheKey);
    if (draft && draft.date === todayStr) {
      setSelectedDate(draft.date);
      setSelectedFineId(draft.fineId);
      setChecks(draft.checks);
      setHasCachedDraft(true);
    } else {
      // Fresh open — initialise everyone as unset
      setSelectedDate(todayStr);
      setSelectedFineId("");
      setChecks(initChecks(dormers));
      setHasCachedDraft(false);
    }
    setSearch("");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-init checks when dormers list changes (e.g. pagination loaded more)
  // but preserve any existing check state
  useEffect(() => {
    setChecks((prev) => {
      const next = { ...prev };
      dormers.forEach((d) => {
        if (!(d.id in next)) next[d.id] = "unset";
      });
      return next;
    });
  }, [dormers]);

  // ── Persist draft on every meaningful change ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const draft: AttendanceDraft = { date: selectedDate, fineId: selectedFineId, checks };
    saveDraft(cacheKey, draft);
  }, [selectedDate, selectedFineId, checks, isOpen, cacheKey]);

  // ── When date changes, clear checks (new session for new date) ─────────────
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const draft = loadDraft(cacheKey);
    if (draft && draft.date === date) {
      setSelectedFineId(draft.fineId);
      setChecks(draft.checks);
      setHasCachedDraft(true);
    } else {
      setChecks(initChecks(dormers));
      setSelectedFineId("");
      setHasCachedDraft(false);
    }
  };

  // ── Filtered list for search ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q && !room) return dormers;
   
    const filter = dormers.filter(
      (d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.room_number ?? "").toLowerCase().includes(q)
    );
    if (room) {
      return filter.filter((d) => d.room_number === room);
    }
    return filter;
  }, [dormers, search, room]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all = Object.values(checks);
    return {
      present: all.filter((s) => s === "present").length,
      absent: all.filter((s) => s === "absent").length,
      unset: all.filter((s) => s === "unset").length,
    };
  }, [checks]);

  const selectedFine = payableFines.find((f) => f.id === selectedFineId) ?? null;
  const canGenerate =
    selectedFineId !== "" && stats.absent > 0 && stats.unset === 0 && !isSubmitting;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggle = (id: string) => {
    setChecks((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const markAll = (status: "present" | "absent") => {
    const next: Record<string, AttendanceStatus> = {};
    dormers.forEach((d) => (next[d.id] = status));
    setChecks(next);
  };

  const handleSubmit = async () => {
    const absentDormerIds = Object.entries(checks)
      .filter(([, s]) => s === "absent")
      .map(([id]) => id);

    await onSubmit({
      date: selectedDate,
      fineId: selectedFineId,
      absentDormerIds,
    });

    clearDraft(cacheKey);
    handleClose();
  };

  const handleClose = () => {
    // Don't clear draft on close — that's the point of caching
    setSearch("");
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-red-600" />
            Record attendance
          </DialogTitle>
          <DialogDescription className="text-sm">
            Tap a dormer to mark them present (✓) or absent. Fines are generated only for absent dormers.
          </DialogDescription>
          {hasCachedDraft && (
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-1.5 w-fit mt-1">
              <Save className="h-3 w-3" />
              Draft restored — continue where you left off
            </div>
          )}
        </DialogHeader>

        {/* Controls */}
        <div className="px-6 py-3 border-b flex flex-wrap gap-3 items-center shrink-0">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={isSubmitting}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground font-medium">Fine type</label>
            <Select
              value={selectedFineId}
              onValueChange={setSelectedFineId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select fine type…" />
              </SelectTrigger>
              <SelectContent>
                {payableFines.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} — ₱{f.amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-end pb-0.5 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => markAll("present")}
              disabled={isSubmitting}
            >
              <Check className="h-3 w-3 mr-1" />
              All present
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => markAll("absent")}
              disabled={isSubmitting}
            >
              All absent
            </Button>
          </div>
        </div>

        {/* Search and Filter by Room */}
        <div className="px-6 py-2 border-b shrink-0 flex flex-row gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, room, or email…"
              className="pl-9 h-8 text-sm"
              disabled={isSubmitting}
            />
          </div>
          <div>
             <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select room…" />
                </SelectTrigger>
                <SelectContent>
                  {roomNumbers.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
        </div>

        {/* Checklist — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <Users className="h-8 w-8 opacity-30" />
              No dormers match your search.
            </div>
          ) : (
            filtered.map((dormer) => {
              const status = checks[dormer.id] ?? "unset";
              const isPresent = status === "present";
              const isAbsent = status === "absent";

              return (
                <button
                  key={dormer.id}
                  onClick={() => toggle(dormer.id)}
                  disabled={isSubmitting}
                  className={[
                    "w-full flex items-center gap-3 px-6 py-3 text-left border-b last:border-b-0 transition-colors",
                    "hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50",
                    isAbsent ? "bg-red-50/60" : "",
                    isPresent ? "bg-green-50/40" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Avatar */}
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${avatarColour(dormer.id)}`}
                  >
                    {initials(dormer.first_name, dormer.last_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {dormer.first_name} {dormer.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dormer.room_number ? `Room ${dormer.room_number} · ` : ""}
                      {dormer.email}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {status === "unset" && (
                      <span className="text-xs text-muted-foreground italic">tap to record</span>
                    )}
                    {isPresent && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs font-medium border-0">
                        Present
                      </Badge>
                    )}
                    {isAbsent && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-medium border-0">
                        Absent
                      </Badge>
                    )}

                    {/* Checkbox */}
                    <div
                      className={[
                        "h-5 w-5 rounded border-[1.5px] flex items-center justify-center transition-all",
                        isPresent
                          ? "bg-green-600 border-green-600"
                          : "border-input bg-background",
                      ].join(" ")}
                    >
                      {isPresent && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t flex items-center shrink-0 gap-3">
          {/* Stats summary */}
          <div className="flex-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>
              <span className="font-semibold text-green-700">{stats.present}</span> present
            </span>
            <span>
              <span className="font-semibold text-red-700">{stats.absent}</span> absent
            </span>
            {stats.unset > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                {stats.unset} unrecorded
              </span>
            )}
          </div>

          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} size="sm">
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            size="sm"
            onClick={handleSubmit}
            disabled={!canGenerate}
          >
            <Zap className="h-3.5 w-3.5" />
            {isSubmitting
              ? `Generating ${stats.absent} fine${stats.absent !== 1 ? "s" : ""}…`
              : stats.absent > 0
              ? `Generate ${stats.absent} fine${stats.absent !== 1 ? "s" : ""}`
              : "Generate fines"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initChecks(dormers: Dormer[]): Record<string, AttendanceStatus> {
  const out: Record<string, AttendanceStatus> = {};
  dormers.forEach((d) => (out[d.id] = "unset"));
  return out;
}