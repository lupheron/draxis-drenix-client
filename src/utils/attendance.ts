/**
 * Attendance display — mirrors Admin `attendance-display.ts`.
 *
 * Contract (backend):
 * - Time Local = Face ID wall at Asia/Tashkent → stored as real UTC
 * - Shift Date = sheet column F (overnight 18:00→03:00 stays on start day)
 * - Break is an event type only — never a day badge
 *
 * If production still has pre-fix rows (Time Local parsed as Chicago), clocks
 * will look wrong on BOTH Admin and Client until attendance is re-synced.
 */
import type { AttendanceDay, AttendanceEvent, AttendanceStatus } from "@/lib/types";
import { BUSINESS_TIMEZONE, DESK_TIMEZONE } from "@/utils/timezones";

export type AttendanceClockZone = typeof DESK_TIMEZONE | typeof BUSINESS_TIMEZONE;

export const ATTENDANCE_CLOCK_ZONES: AttendanceClockZone[] = [
  DESK_TIMEZONE,
  BUSINESS_TIMEZONE,
];

export function attendanceClockZoneLabel(zone: AttendanceClockZone): string {
  return zone === DESK_TIMEZONE ? "Tashkent (Face ID)" : "US Central";
}

/** Format UTC ISO punch as wall clock in the selected zone (same as Admin). */
export function formatAttendanceTime(
  value: string | null | undefined,
  zone: AttendanceClockZone = DESK_TIMEZONE,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Day badges: Checked in | Late | No show | Excused | Pending review.
 * Never Break. Aligns with Admin resolveDisplayDayStatus.
 */
export function attendanceDisplayStatus(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
  hasCheckIn = false,
): string {
  if (!status && !hasCheckIn && lateMinutes <= 0) return "pending_review";
  if (status === "no_show") return "no_show";
  if (status === "excused") return "excused";
  if (status === "pending_review" || status === "missing_punch") {
    return "pending_review";
  }
  if (status === "late" || lateMinutes > 0) return "late";
  if (
    status === "break" ||
    status === "present" ||
    hasCheckIn
  ) {
    return "present";
  }
  return status || "pending_review";
}

const STATUS_LABELS: Record<string, string> = {
  present: "Checked in",
  late: "Late",
  no_show: "No show",
  break: "Checked in",
  missing_punch: "Pending review",
  excused: "Excused",
  pending_review: "Pending review",
};

export function attendanceStatusLabel(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
  hasCheckIn = false,
): string {
  const display = attendanceDisplayStatus(status, lateMinutes, hasCheckIn);
  return STATUS_LABELS[display] ?? display.replaceAll("_", " ");
}

export function attendanceStatusTone(
  status: AttendanceStatus | string | null | undefined,
  lateMinutes = 0,
  hasCheckIn = false,
): { bg: string; text: string; border: string } {
  switch (attendanceDisplayStatus(status, lateMinutes, hasCheckIn)) {
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

export function eventKind(
  event: Pick<AttendanceEvent, "type" | "event_kind" | "action">,
): string {
  if (event.event_kind) return String(event.event_kind).toLowerCase();
  if (event.type) return String(event.type).toLowerCase();
  const action = String(event.action ?? "").toLowerCase();
  if (action.includes("break")) return "break";
  if (/check.?in|checked in|entered/.test(action)) return "check_in";
  if (/check.?out|checked out|exit/.test(action)) return "check_out";
  return "other";
}

export function isAttendanceCheckPunch(
  event: string | Pick<AttendanceEvent, "type" | "event_kind" | "action"> | null | undefined,
): boolean {
  if (event == null) return false;
  const kind =
    typeof event === "string" ? event.toLowerCase() : eventKind(event);
  return kind === "check_in" || kind === "check_out";
}

export function attendancePunchLabel(
  event: string | Pick<AttendanceEvent, "type" | "event_kind" | "action"> | null | undefined,
): string {
  if (event == null) return "Punch";
  const kind =
    typeof event === "string" ? event.toLowerCase() : eventKind(event);
  if (kind === "check_in") return "Check in";
  if (kind === "check_out") return "Check out";
  return kind.replaceAll("_", " ");
}

/**
 * Prefer first check-in + last check-out from events (Admin parseDayEvents),
 * falling back to day aggregate fields.
 */
export function resolveDayPunches(day: AttendanceDay): {
  checkInAt: string | null;
  checkOutAt: string | null;
  shiftWindow: string | null;
} {
  const events = day.events ?? [];
  const checkIns = events.filter((e) => eventKind(e) === "check_in");
  const checkOuts = events.filter((e) => eventKind(e) === "check_out");

  const checkInAt =
    checkIns[0]?.occurred_at ?? day.check_in_at ?? null;
  const checkOutAt =
    checkOuts.length > 0
      ? checkOuts[checkOuts.length - 1]?.occurred_at ?? null
      : day.check_out_at ?? null;

  const shiftWindow =
    day.shift_start ||
    day.shift ||
    checkIns[0]?.shift ||
    checkOuts[0]?.shift ||
    day.shift_end ||
    null;

  return { checkInAt, checkOutAt, shiftWindow };
}
