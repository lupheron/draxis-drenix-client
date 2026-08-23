import type { AttendanceStatus } from "@/lib/types";
import { BUSINESS_TIMEZONE } from "@/utils/timezones";

const STATUS_LABELS: Record<string, string> = {
  present: "Present",
  late: "Late",
  no_show: "No show",
  break: "Break",
  missing_punch: "Missing punch",
  excused: "Excused",
  pending_review: "Pending review",
};

export function attendanceStatusLabel(
  status: AttendanceStatus | string | null | undefined,
): string {
  if (!status) return "No data";
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function attendanceStatusTone(
  status: AttendanceStatus | string | null | undefined,
): { bg: string; text: string; border: string } {
  switch (status) {
    case "present":
      return {
        bg: "bg-[#d8f3e5]",
        text: "text-[#15803d]",
        border: "border-[#8dceb0]",
      };
    case "late":
      return {
        bg: "bg-[#fde7d6]",
        text: "text-[#ea580c]",
        border: "border-[#f0b27a]",
      };
    case "no_show":
      return {
        bg: "bg-[#fde2e4]",
        text: "text-[#c1121f]",
        border: "border-[#e7a0a6]",
      };
    case "break":
      return {
        bg: "bg-[#dbe7fb]",
        text: "text-[#1d4ed8]",
        border: "border-[#93b4f0]",
      };
    case "excused":
      return {
        bg: "bg-[#f8ecc4]",
        text: "text-[#ca8a04]",
        border: "border-[#e0c36a]",
      };
    case "pending_review":
      return {
        bg: "bg-[#eef2f6]",
        text: "text-[#415664]",
        border: "border-[#c5d3de]",
      };
    case "missing_punch":
      return {
        bg: "bg-[#fde7d6]",
        text: "text-[#9a3412]",
        border: "border-[#fdba74]",
      };
    default:
      return {
        bg: "bg-[var(--accent-dim)]",
        text: "text-[var(--muted-foreground)]",
        border: "border-[var(--border)]",
      };
  }
}

/** Format ISO timestamp in America/Chicago as h:mm a. */
export function formatAttendanceTime(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatAttendanceDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}
