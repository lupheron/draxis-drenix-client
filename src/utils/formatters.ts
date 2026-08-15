import type { EmployeeShift } from "@/lib/types";
import { getZonedParts, tashkentDeskShiftInCentral } from "@/utils/timezones";

const SHIFT_LABELS: Record<EmployeeShift, string> = {
  afternoon: "Afternoon · 14:00–22:00 CT",
  night: "Night · 22:00–06:00 CT",
  flexible: "Flexible · 09:00–17:00 CT",
  morning: "Morning",
};

export function formatShift(
  shift: EmployeeShift | string | null | undefined,
): string {
  if (!shift) return "—";
  if (shift === "morning") {
    const { label } = tashkentDeskShiftInCentral();
    return `Morning · ${label}`;
  }
  return SHIFT_LABELS[shift as EmployeeShift] ?? shift;
}

export function formatPersonName(
  first?: string | null,
  last?: string | null,
): string {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || "Team member";
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMinutes(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0m";
  if (value < 60) return `${Math.round(value)}m`;
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

/** Greeting based on America/Chicago clock hour. */
export function greetingForNow(date = new Date()): string {
  const { hour } = getZonedParts(date);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
