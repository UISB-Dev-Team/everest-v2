// features/academic-period/PeriodSelector.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAcademicPeriod } from "../hooks/useAcademicPeriods";

export function PeriodSelector() {
    const { all, selected, setSelected } = useAcademicPeriod();

    if (all.length === 0) return null;

    return (
        <Select
            value={selected?.id}
            onValueChange={(id) => {
                const period = all.find((p) => p.id === id);
                if (period) setSelected(period);
            }}
        >
            <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
                {all.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                        {p.academic_year} — {p.semester}
                        {p.is_current ? " (Current)" : ""}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}