import { BUSINESS_TIMEZONE } from "@/utils/timezones";

/** Business calendar timezone for DRAXIS Client (metrics / date filters). */
export const APP_TIMEZONE = BUSINESS_TIMEZONE;
export const APP_TIMEZONE_LABEL = "Central Time";

export type DatePreset = "day" | "week" | "month" | "year" | "custom";

/** Calendar YYYY-MM-DD in America/Chicago. */
export function formatDateInCentral(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** @deprecated Use formatDateInCentral — kept name for call sites. */
export function formatDateInput(date: Date): string {
  return formatDateInCentral(date);
}

export function getCentralParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const bag = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
  };
}

/** Shift a YYYY-MM-DD calendar day by N days (timezone-safe date math). */
export function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 0 = Sunday … 6 = Saturday for a calendar YMD. */
export function weekdayForYmd(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

/**
 * Presets are calendar-based in America/Chicago (not rolling windows):
 * - day: today CT
 * - week: Monday of this CT week → today CT
 * - month: 1st of this CT month → today CT
 * - year: Jan 1 of this CT year → today CT
 */
export function getDateRangeForPreset(
  preset: DatePreset,
  custom?: { from: string; to: string },
): { from: string; to: string } {
  if (preset === "custom" && custom) {
    return custom;
  }

  const to = formatDateInCentral(new Date());
  let from = to;

  if (preset === "day") {
    from = to;
  } else if (preset === "week") {
    const weekday = weekdayForYmd(to);
    const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
    from = addDaysToYmd(to, -daysFromMonday);
  } else if (preset === "month") {
    const [year, month] = to.split("-");
    from = `${year}-${month}-01`;
  } else if (preset === "year") {
    const [year] = to.split("-");
    from = `${year}-01-01`;
  }

  return { from, to };
}
