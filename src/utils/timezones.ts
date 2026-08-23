/** Business calendar + display clocks: America/Chicago (Central Time). */
export const BUSINESS_TIMEZONE = "America/Chicago";

/** Desk sits in Tashkent; shift hours are defined here, then shown in CT. */
export const DESK_TIMEZONE = "Asia/Tashkent";

/** HR desk window in Tashkent: 18:00 → 03:00 next day (9 hours). */
export const TASHKENT_DESK_SHIFT = {
  startHour: 18,
  startMinute: 0,
  endHour: 3,
  endMinute: 0,
} as const;

export function getZonedParts(
  date: Date,
  timeZone: string = BUSINESS_TIMEZONE,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const bag = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Build a UTC Date from a civil wall-clock in `timeZone`. */
export function zonedWallTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = getZonedParts(new Date(guess), timeZone);
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
  );
  return new Date(guess + (guess - asIfUtc));
}

function addCalendarDay(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } {
  const next = new Date(Date.UTC(year, month - 1, day + 1, 12));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function clock(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

/**
 * Convert Tashkent 18:00–03:00 into America/Chicago wall clock.
 * CDT: 08:00–17:00 · CST: 07:00–16:00
 */
export function tashkentDeskShiftInCentral(now = new Date()): {
  start: string;
  end: string;
  label: string;
} {
  const desk = getZonedParts(now, DESK_TIMEZONE);
  const startUtc = zonedWallTimeToUtc(
    DESK_TIMEZONE,
    desk.year,
    desk.month,
    desk.day,
    TASHKENT_DESK_SHIFT.startHour,
    TASHKENT_DESK_SHIFT.startMinute,
  );
  const endDay = addCalendarDay(desk.year, desk.month, desk.day);
  const endUtc = zonedWallTimeToUtc(
    DESK_TIMEZONE,
    endDay.year,
    endDay.month,
    endDay.day,
    TASHKENT_DESK_SHIFT.endHour,
    TASHKENT_DESK_SHIFT.endMinute,
  );

  const startCt = getZonedParts(startUtc, BUSINESS_TIMEZONE);
  const endCt = getZonedParts(endUtc, BUSINESS_TIMEZONE);
  const start = clock(startCt.hour, startCt.minute);
  const end = clock(endCt.hour, endCt.minute);

  return {
    start,
    end,
    label: `${start}–${end} CT`,
  };
}
