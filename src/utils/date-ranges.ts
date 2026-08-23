import { BUSINESS_TIMEZONE } from "@/utils/timezones";
import type { PerformancePeriod } from "@/lib/types";

/** Calendar YYYY-MM-DD in America/Chicago. */
export function formatDateInCentral(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Shift a YYYY-MM-DD calendar day by N days (timezone-safe date math). */
function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 0 = Sunday … 6 = Saturday for a calendar YMD. */
function weekdayForYmd(ymd: string): number {
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
  preset: PerformancePeriod,
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
