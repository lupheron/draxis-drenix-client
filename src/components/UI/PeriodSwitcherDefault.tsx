"use client";

import type { PerformancePeriod } from "@/lib/types";
import { cn } from "@/lib/cn";

const PERIODS: { id: PerformancePeriod; label: string; hint: string }[] = [
  { id: "day", label: "Day", hint: "Today" },
  { id: "week", label: "Week", hint: "This week" },
  { id: "month", label: "Month", hint: "This month" },
  { id: "year", label: "Year", hint: "This year" },
  { id: "custom", label: "Custom", hint: "Pick dates" },
];

type PeriodSwitcherDefaultProps = {
  activePeriod: PerformancePeriod;
  onChange: (period: PerformancePeriod) => void;
  className?: string;
};

export default function PeriodSwitcherDefault({
  activePeriod,
  onChange,
  className,
}: PeriodSwitcherDefaultProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-lg bg-[var(--accent-dim)] p-1",
        className,
      )}
    >
      {PERIODS.map((period) => {
        const isActive = period.id === activePeriod;

        return (
          <button
            key={period.id}
            type="button"
            title={period.hint}
            onClick={() => onChange(period.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-200",
              isActive
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:bg-[var(--ink-blue-soft)] hover:text-[var(--ink-blue)]",
            )}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
