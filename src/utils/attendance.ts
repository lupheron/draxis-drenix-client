import type { AttendanceStatus } from "@/lib/types";
import {
  BUSINESS_TIMEZONE,
  DESK_TIMEZONE,
  getZonedParts,
  zonedWallTimeToUtc,
} from "@/utils/timezones";

/** How punch clocks are shown in the Client Portal. */
export type AttendanceClockZone = "tashkent" | "central";

/**
 * Sheet "Time Local" is Face ID wall time at the Tashkent desk.
 * Sync currently parses that wall clock as America/Chicago, so formatting
 * the stored ISO in Chicago reproduces the Face ID / Tashkent digits.
 * US Central view reinterprets those digits as Asia/Tashkent, then formats CT.
 */
export function formatAttendanceTime(
  value: string | null | undefined,
  zone: AttendanceClockZone = "tashkent",
): string {
  if (!value) return "—";
  const stored = new Date(value);
  if (Number.isNaN(stored.getTime())) return "—";

  const display =
    zone === "tashkent"
      ? stored
      : sheetWallAsTashkentToCentralInstant(stored);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(display);
}

function sheetWallAsTashkentToCentralInstant(stored: Date): Date {
  const wall = getZonedParts(stored, BUSINESS_TIMEZONE);
  return zonedWallTimeToUtc(
    DESK_TIMEZONE,
    wall.year,
    wall.month,
    wall.day,
    wall.hour,
    wall.minute,
  );
}

export function attendanceClockZoneLabel(zone: AttendanceClockZone): string {
  return zone === "tashkent" ? "Tashkent (Face ID)" : "US Central";
}

/**
 * Day list / badges: never surface "break".
 * Break means they punched in (and took a break) — show Checked in.
 * Late / no-show / excused / pending keep their meaning.
 */
export function attendanceDisplayStatus(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
): string {
  if (!status) return "pending_review";
  if (status === "no_show") return "no_show";
  if (status === "late" || (lateMinutes > 0 && status !== "excused")) {
    return "late";
  }
  if (status === "break" || status === "missing_punch" || status === "present") {
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

/** Punches shown in Client Portal day detail (no break noise). */
export function isAttendanceCheckPunch(type: string | null | undefined): boolean {
  const t = String(type ?? "").toLowerCase();
  return t === "check_in" || t === "check_out";
}

export function attendancePunchLabel(type: string | null | undefined): string {
  const t = String(type ?? "").toLowerCase();
  if (t === "check_in") return "Check in";
  if (t === "check_out") return "Check out";
  return String(type ?? "Punch").replaceAll("_", " ");
}
