"use client";

import { useMemo, useState } from "react";
import DatePickerDefault from "@/components/FormItems/DatePicker/DatePickerDefault";
import PeriodSwitcherDefault from "@/components/UI/PeriodSwitcherDefault";
import type { PerformancePeriod } from "@/lib/types";
import { getDateRangeForPreset } from "@/utils/date-ranges";

export function usePeriodRange(defaultPeriod: PerformancePeriod = "month") {
  const [period, setPeriod] = useState<PerformancePeriod>(defaultPeriod);
  const [custom, setCustom] = useState(() => getDateRangeForPreset("month"));

  const range = useMemo(
    () => getDateRangeForPreset(period, custom),
    [period, custom],
  );

  return {
    period,
    setPeriod,
    custom,
    setCustom,
    range,
  };
}

export function PeriodControls({
  period,
  onPeriodChange,
  custom,
  onCustomChange,
}: {
  period: PerformancePeriod;
  onPeriodChange: (period: PerformancePeriod) => void;
  custom: { from: string; to: string };
  onCustomChange: (next: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <PeriodSwitcherDefault
        activePeriod={period}
        onChange={onPeriodChange}
      />
      {period === "custom" ? (
        <div className="flex flex-wrap gap-3">
          <DatePickerDefault
            label="From"
            value={custom.from}
            onChange={(from) => onCustomChange({ ...custom, from })}
            max={custom.to}
          />
          <DatePickerDefault
            label="To"
            value={custom.to}
            onChange={(to) => onCustomChange({ ...custom, to })}
            min={custom.from}
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          {rangeLabel(period, custom)}
        </p>
      )}
    </div>
  );
}

function rangeLabel(
  period: PerformancePeriod,
  custom: { from: string; to: string },
): string {
  const { from, to } = getDateRangeForPreset(period, custom);
  return `${from} → ${to} CT`;
}
