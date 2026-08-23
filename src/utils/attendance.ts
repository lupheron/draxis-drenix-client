import type { AttendanceStatus } from "@/lib/types";
import { BUSINESS_TIMEZONE, DESK_TIMEZONE } from "@/utils/timezones";

/** How punch clocks are shown in the Client Portal. */
export type AttendanceClockZone = "tashkent" | "central";

/**
 * Format attendance punch times.
 * Backend stores occurred_at / check_* as real UTC (Time Local parsed as Asia/Tashkent).
 * Toggle only changes the display zone — Shift Date labels stay as sheet shift dates.
 */
export function formatAttendanceTime(
  value: string | null | undefined,
  zone: AttendanceClockZone = "tashkent",
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone === "tashkent" ? DESK_TIMEZONE : BUSINESS_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function attendanceClockZoneLabel(zone: AttendanceClockZone): string {
  return zone === "tashkent" ? "Tashkent (Face ID)" : "US Central";
}

/**
 * Day badges: never surface "break".
 * Break is an event type only — map to Checked in (matches Admin).
 * Late when status is late OR late_minutes > 0 (unless excused / no_show).
 */
export function attendanceDisplayStatus(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
): string {
  if (!status) return "pending_review";
  if (status === "no_show") return "no_show";
  if (status === "excused") return "excused";
  if (status === "late" || lateMinutes > 0) return "late";
  if (
    status === "break" ||
    status === "missing_punch" ||
    status === "present"
  ) {
    return "present";
  }
  return status;
}

const STATUS_LABELS: Record<string, string> = {
  present: "Checked in",
  late: "Late",
  no_show: "No show",
  break: "Checked in",
  missing_punch: "Checked in",
  excused: "Excused",
  pending_review: "Pending review",
};

export function attendanceStatusLabel(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
): string {
  const display = attendanceDisplayStatus(status, lateMinutes);
  return STATUS_LABELS[display] ?? display.replaceAll("_", " ");
}

export function attendanceStatusTone(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
): { bg: string; text: string; border: string } {
  switch (attendanceDisplayStatus(status, lateMinutes)) {
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
    default:
      return {
        bg: "bg-[var(--accent-dim)]",
        text: "text-[var(--muted-foreground)]",
        border: "border-[var(--border)]",
      };
  }
}

/** Shift Date label (sheet column F) — not recomputed from US midnight. */
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

/** Employee day detail: check-in / check-out only (breaks stay on Admin). */
export function isAttendanceCheckPunch(
  type: string | null | undefined,
): boolean {
  const t = String(type ?? "").toLowerCase();
  return (
    t === "check_in" ||
    t === "check_out" ||
    t === "checked_in" ||
    t === "checked_out"
  );
}

export function attendancePunchLabel(type: string | null | undefined): string {
  const t = String(type ?? "").toLowerCase();
  if (t === "check_in" || t === "checked_in") return "Check in";
  if (t === "check_out" || t === "checked_out") return "Check out";
  return String(type ?? "Punch").replaceAll("_", " ");
}
