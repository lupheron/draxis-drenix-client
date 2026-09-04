"use client";

import Link from "next/link";
import { useMyAttendanceSummary } from "@/hooks/useAttendance";
import { ApiError } from "@/lib/api/client";
import LoadingDefault from "@/components/UI/LoadingDefault";
import {
  attendanceStatusLabel,
  attendanceStatusTone,
  effectiveLateMinutes,
  formatAttendanceTime,
} from "@/utils/attendance";
import { cn } from "@/lib/cn";
import { DESK_TIMEZONE } from "@/utils/timezones";

type AttendanceSummaryCardProps = {
  from: string;
  to: string;
  periodLabel: string;
};

export default function AttendanceSummaryCard({
  from,
  to,
  periodLabel,
}: AttendanceSummaryCardProps) {
  const summaryQuery = useMyAttendanceSummary(from, to);
  const summary = summaryQuery.data;
  const todayTone = attendanceStatusTone(
    summary?.today.status,
    summary?.today.late_minutes ?? 0,
    Boolean(summary?.today.check_in_at),
  );

  const errorMessage =
    summaryQuery.error instanceof ApiError
      ? summaryQuery.error.message
      : summaryQuery.isError
        ? "Could not load attendance."
        : null;

  return (
    <section className="animate-rise overflow-hidden rounded-2xl border border-[#9dbcd4] bg-[linear-gradient(145deg,#e8f1f8_0%,#f7fafc_55%)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-blue)]">
            Attendance · Tashkent Face ID
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">
            Clock status
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Today + {periodLabel.toLowerCase()} · overnight shifts OK
          </p>
        </div>
        <Link
          href="/attendance"
          className="rounded-md border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)] transition-colors hover:bg-[var(--accent-dim)]"
        >
          Open attendance
        </Link>
      </div>

      {errorMessage ? (
        <p className="mt-4 text-sm text-[var(--danger)]">{errorMessage}</p>
      ) : summaryQuery.isLoading ? (
        <div className="mt-4">
          <LoadingDefault label="Loading attendance" />
        </div>
      ) : summary ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className={cn(
              "rounded-xl border px-4 py-3",
              todayTone.bg,
              todayTone.border,
            )}
          >
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                todayTone.text,
              )}
            >
              Today · {summary.today.date}
            </p>
            <p
              className={cn(
                "mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold",
                todayTone.text,
              )}
            >
              {attendanceStatusLabel(
                summary.today.status,
                summary.today.late_minutes,
                Boolean(summary.today.check_in_at),
              )}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              In{" "}
              {formatAttendanceTime(
                summary.today.check_in_at,
                DESK_TIMEZONE,
              )}{" "}
              · Out{" "}
              {formatAttendanceTime(
                summary.today.check_out_at,
                DESK_TIMEZONE,
              )}
              {effectiveLateMinutes(summary.today.late_minutes) > 0
                ? ` · ${effectiveLateMinutes(summary.today.late_minutes)}m late`
                : ""}
            </p>
          </div>

          <MiniStat
            label="Checked in"
            value={
              summary.period.present_days + summary.period.break_days
            }
            hint={periodLabel}
          />
          <MiniStat
            label="Late"
            value={summary.period.late_days}
            hint={periodLabel}
          />
          <MiniStat
            label="Open requests"
            value={summary.period.pending_requests}
            hint="Disputes & absences"
          />
        </div>
      ) : null}
    </section>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}
