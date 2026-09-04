"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import LoadingDefault from "@/components/UI/LoadingDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import {
  useCreateAttendanceRequest,
  useMyAttendanceDay,
  useMyAttendanceDays,
  useMyAttendanceRequests,
  useMyAttendanceSummary,
} from "@/hooks/useAttendance";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type {
  AttendanceDay,
  AttendanceRequest,
  AttendanceRequestType,
  AttendanceSummary,
} from "@/lib/types";
import {
  attendanceClockZoneLabel,
  attendancePunchLabel,
  attendanceStatusLabel,
  attendanceStatusTone,
  effectiveLateMinutes,
  formatAttendanceDate,
  formatAttendanceTime,
  isAttendanceCheckPunch,
  resolveDayPunches,
  type AttendanceClockZone,
} from "@/utils/attendance";
import { formatDateInCentral } from "@/utils/date-ranges";
import { BUSINESS_TIMEZONE, DESK_TIMEZONE } from "@/utils/timezones";

const PERIOD_LABELS = {
  day: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  custom: "Custom range",
} as const;

export default function AttendanceView() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "days";
  const { period, setPeriod, custom, setCustom, range } =
    usePeriodRange("month");

  const today = formatDateInCentral();
  const [clockZone, setClockZone] =
    useState<AttendanceClockZone>(DESK_TIMEZONE);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [requestType, setRequestType] =
    useState<AttendanceRequestType>("dispute");
  const [requestDate, setRequestDate] = useState(today);
  const [requestMessage, setRequestMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const summaryQuery = useMyAttendanceSummary(range.from, range.to);
  const daysQuery = useMyAttendanceDays(range.from, range.to);
  const dayQuery = useMyAttendanceDay(selectedDate);
  const requestsQuery = useMyAttendanceRequests();
  const createRequest = useCreateAttendanceRequest();

  const days = daysQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const summary = summaryQuery.data;
  const periodLabel = PERIOD_LABELS[period];
  const zoneHint = attendanceClockZoneLabel(clockZone);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const [daysPanelHeight, setDaysPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      setSelectedDate(days[0].date);
    }
  }, [days, selectedDate]);

  const selectedFromList = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? null,
    [days, selectedDate],
  );

  const selectedDay: AttendanceDay | null = useMemo(() => {
    const fromQuery = dayQuery.data ?? null;
    const fromList = selectedFromList;
    if (fromQuery && fromList && fromQuery.date === fromList.date) {
      // Same Shift Date: keep list check-in/out (stable) + detail events
      return {
        ...fromList,
        events: fromQuery.events ?? fromList.events,
        sheet_note: fromQuery.sheet_note ?? fromList.sheet_note,
        admin_note: fromQuery.admin_note ?? fromList.admin_note,
      };
    }
    return fromQuery ?? fromList;
  }, [dayQuery.data, selectedFromList]);

  useEffect(() => {
    const el = rightColumnRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const syncHeight = () => {
      const desktop = window.matchMedia("(min-width: 1280px)").matches;
      if (!desktop) {
        setDaysPanelHeight(null);
        return;
      }
      const next = Math.round(el.getBoundingClientRect().height);
      setDaysPanelHeight(next > 0 ? next : null);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    window.addEventListener("resize", syncHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [selectedDay, view, clockZone]);

  const listError =
    daysQuery.error instanceof ApiError
      ? daysQuery.error.message
      : daysQuery.isError
        ? "Could not load attendance days."
        : null;

  function selectDay(day: AttendanceDay) {
    setSelectedDate(day.date);
    setRequestDate(day.date);
    setRequestType("dispute");
    setFormError(null);
    setFormSuccess(null);
  }

  async function onSubmitRequest(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const message = requestMessage.trim();
    if (!message) {
      setFormError("Add a short message for HR.");
      return;
    }

    try {
      await createRequest.mutateAsync({
        type: requestType,
        date: requestDate,
        message,
        related_day_id:
          requestType === "dispute" && selectedDay?.date === requestDate
            ? selectedDay.id
            : undefined,
      });
      setRequestMessage("");
      setFormSuccess(
        requestType === "dispute"
          ? "Dispute submitted — pending review."
          : "Absence notice submitted — pending review.",
      );
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Could not submit your request.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(135deg,#d7e7f2_0%,#d5f0eb_48%,#f5e8c7_100%)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-blue)]">
          Attendance · Desk in Tashkent · Logistics in US Central
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Your clock record
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Face ID is Tashkent; logistics is US Central. Each row is a Shift Date
          from the sheet (overnight 6:00 PM → 3:00 AM stays on the start day).
          Toggle clocks below — dates stay on Shift Date.
        </p>
      </section>

      <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="mb-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-blue)]">
              Shift Date filter
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {range.from} → {range.to} · clocks as {zoneHint}
            </p>
          </div>
          <ClockZoneToggle value={clockZone} onChange={setClockZone} />
        </div>
        <PeriodControls
          period={period}
          onPeriodChange={setPeriod}
          custom={custom}
          onCustomChange={setCustom}
        />
      </section>

      {summaryQuery.isLoading ? (
        <LoadingDefault label="Loading attendance summary" />
      ) : summaryQuery.isError ? (
        <EmptyStateDefault
          title="Summary unavailable"
          description={
            summaryQuery.error instanceof ApiError
              ? summaryQuery.error.message
              : "Could not load attendance summary."
          }
        />
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TodayCard summary={summary} clockZone={clockZone} />
          <PeriodStat
            label="Checked in"
            value={summary.period.present_days + summary.period.break_days}
            hint={periodLabel}
            accent="green"
          />
          <PeriodStat
            label="Late / no-show"
            value={summary.period.late_days + summary.period.no_show_days}
            hint={`${summary.period.late_days} late · ${summary.period.no_show_days} no-show`}
            accent="orange"
          />
          <PeriodStat
            label="Pending requests"
            value={summary.period.pending_requests}
            hint="Awaiting HR"
            accent="blue"
          />
        </div>
      ) : null}

      {view === "requests" ? (
        <RequestsPanel
          requests={requests}
          loading={requestsQuery.isLoading}
          error={
            requestsQuery.error instanceof ApiError
              ? requestsQuery.error.message
              : requestsQuery.isError
                ? "Could not load requests."
                : null
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-5 xl:items-start">
          <section
            className="xl:col-span-3 flex min-h-0 flex-col overflow-hidden animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 shadow-[var(--shadow-soft)] max-xl:max-h-[min(28rem,70vh)]"
            style={
              daysPanelHeight
                ? { height: daysPanelHeight, maxHeight: daysPanelHeight }
                : undefined
            }
          >
            <header className="shrink-0 border-b border-[var(--border)] px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
                    Days
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Checked in or Late only · times in {zoneHint}
                  </p>
                </div>
                <ClockZoneToggle value={clockZone} onChange={setClockZone} />
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {listError ? (
                <div className="p-5">
                  <EmptyStateDefault
                    title="Days unavailable"
                    description={listError}
                  />
                </div>
              ) : daysQuery.isLoading ? (
                <div className="p-5">
                  <LoadingDefault label="Loading days" />
                </div>
              ) : days.length === 0 ? (
                <div className="p-5">
                  <EmptyStateDefault
                    title="No days in range"
                    description="Sheet sync may not have rows for this window yet."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {days.map((day) => {
                    const punches = resolveDayPunches(day);
                    const hasCheckIn = Boolean(punches.checkInAt);
                    const tone = attendanceStatusTone(
                      day.status,
                      day.late_minutes,
                      hasCheckIn,
                    );
                    const active = day.date === selectedDate;
                    return (
                      <li key={day.id}>
                        <button
                          type="button"
                          onClick={() => selectDay(day)}
                          className={cn(
                            "flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors",
                            active
                              ? "bg-[var(--accent-dim)]"
                              : "hover:bg-[var(--surface)]",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[var(--foreground)]">
                              {formatAttendanceDate(day.date)}
                            </p>
                            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                              In{" "}
                              {formatAttendanceTime(
                                punches.checkInAt,
                                clockZone,
                              )}{" "}
                              · Out{" "}
                              {formatAttendanceTime(
                                punches.checkOutAt,
                                clockZone,
                              )}
                              {effectiveLateMinutes(day.late_minutes) > 0
                                ? ` · ${effectiveLateMinutes(day.late_minutes)}m late`
                                : ""}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                              tone.bg,
                              tone.text,
                              tone.border,
                            )}
                          >
                            {attendanceStatusLabel(
                              day.status,
                              day.late_minutes,
                              hasCheckIn,
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <div
            ref={rightColumnRef}
            className="xl:col-span-2 flex flex-col gap-5"
          >
            <DayDetailPanel
              day={selectedDay}
              clockZone={clockZone}
              loading={
                Boolean(selectedDate) &&
                dayQuery.isLoading &&
                !selectedFromList
              }
              notFound={
                Boolean(selectedDate) &&
                dayQuery.isError &&
                !selectedFromList
              }
            />

            <RequestForm
              requestType={requestType}
              onTypeChange={setRequestType}
              requestDate={requestDate}
              onDateChange={setRequestDate}
              requestMessage={requestMessage}
              onMessageChange={setRequestMessage}
              onSubmit={onSubmitRequest}
              submitting={createRequest.isPending}
              error={formError}
              success={formSuccess}
            />
          </div>
        </div>
      )}

      {view !== "requests" ? (
        <RequestsPanel
          requests={requests}
          loading={requestsQuery.isLoading}
          error={
            requestsQuery.error instanceof ApiError
              ? requestsQuery.error.message
              : requestsQuery.isError
                ? "Could not load requests."
                : null
          }
          compact
        />
      ) : null}
    </div>
  );
}

function ClockZoneToggle({
  value,
  onChange,
}: {
  value: AttendanceClockZone;
  onChange: (zone: AttendanceClockZone) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-1"
      role="group"
      aria-label="Clock timezone"
    >
      {(
        [
          [DESK_TIMEZONE, "Tashkent"],
          [BUSINESS_TIMEZONE, "US Central"],
        ] as const
      ).map(([zone, label]) => {
        const active = value === zone;
        return (
          <button
            key={zone}
            type="button"
            onClick={() => onChange(zone)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TodayCard({
  summary,
  clockZone,
}: {
  summary: AttendanceSummary;
  clockZone: AttendanceClockZone;
}) {
  const tone = attendanceStatusTone(
    summary.today.status,
    summary.today.late_minutes,
    Boolean(summary.today.check_in_at),
  );
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-soft)]",
        tone.bg,
        tone.border,
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.16em]",
          tone.text,
        )}
      >
        Today · {summary.today.date}
      </p>
      <p
        className={cn(
          "mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold",
          tone.text,
        )}
      >
        {attendanceStatusLabel(
          summary.today.status,
          summary.today.late_minutes,
          Boolean(summary.today.check_in_at),
        )}
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        In {formatAttendanceTime(summary.today.check_in_at, clockZone)} · Out{" "}
        {formatAttendanceTime(summary.today.check_out_at, clockZone)}
      </p>
      {summary.today.notes ? (
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {summary.today.notes}
        </p>
      ) : null}
    </div>
  );
}

function PeriodStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: "green" | "orange" | "blue";
}) {
  const shells = {
    green:
      "border-[#8dceb0] bg-[linear-gradient(145deg,#d8f3e5_0%,#f7fafc_55%)]",
    orange:
      "border-[#f0b27a] bg-[linear-gradient(145deg,#fde7d6_0%,#f7fafc_55%)]",
    blue: "border-[#93b4f0] bg-[linear-gradient(145deg,#dbe7fb_0%,#f7fafc_55%)]",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-soft)]",
        shells[accent],
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}

function DayDetailPanel({
  day,
  clockZone,
  loading,
  notFound,
}: {
  day: AttendanceDay | null;
  clockZone: AttendanceClockZone;
  loading: boolean;
  notFound: boolean;
}) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-5 shadow-[var(--shadow-soft)]">
        <LoadingDefault label="Loading day" />
      </section>
    );
  }

  if (notFound || !day) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-5 shadow-[var(--shadow-soft)]">
        <EmptyStateDefault
          title="Select a day"
          description="Pick a day from the list to see check-in / check-out."
        />
      </section>
    );
  }

  const punches = resolveDayPunches(day);
  const tone = attendanceStatusTone(
    day.status,
    day.late_minutes,
    Boolean(punches.checkInAt),
  );
  const checkEvents = (day.events ?? []).filter((event) =>
    isAttendanceCheckPunch(event),
  );

  return (
    <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Day detail · {attendanceClockZoneLabel(clockZone)}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
            {formatAttendanceDate(day.date)}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
            tone.bg,
            tone.text,
            tone.border,
          )}
        >
          {attendanceStatusLabel(
            day.status,
            day.late_minutes,
            Boolean(punches.checkInAt),
          )}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <DetailItem
          label="Check in"
          value={formatAttendanceTime(punches.checkInAt, clockZone)}
        />
        <DetailItem
          label="Check out"
          value={formatAttendanceTime(punches.checkOutAt, clockZone)}
        />
        <DetailItem
          label="Late"
          value={
            effectiveLateMinutes(day.late_minutes) > 0
              ? `${effectiveLateMinutes(day.late_minutes)} min`
              : "—"
          }
        />
        <DetailItem
          label="Shift window"
          value={punches.shiftWindow || "—"}
        />
      </dl>

      {(day.sheet_note || day.admin_note) && (
        <div className="mt-4 space-y-2 text-sm">
          {day.sheet_note ? (
            <p className="text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">
                Sheet:{" "}
              </span>
              {day.sheet_note}
            </p>
          ) : null}
          {day.admin_note ? (
            <p className="text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">
                Admin:{" "}
              </span>
              {day.admin_note}
            </p>
          ) : null}
        </div>
      )}

      {checkEvents.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Check in / out
          </p>
          <ul className="mt-2 space-y-1.5">
            {checkEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--foreground)]">
                  {attendancePunchLabel(event)}
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {formatAttendanceTime(event.occurred_at, clockZone)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className="mt-1 text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function RequestForm({
  requestType,
  onTypeChange,
  requestDate,
  onDateChange,
  requestMessage,
  onMessageChange,
  onSubmit,
  submitting,
  error,
  success,
}: {
  requestType: AttendanceRequestType;
  onTypeChange: (type: AttendanceRequestType) => void;
  requestDate: string;
  onDateChange: (date: string) => void;
  requestMessage: string;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent) => void;
  submitting: boolean;
  error: string | null;
  success: string | null;
}) {
  return (
    <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-5 shadow-[var(--shadow-soft)]">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
        New request
      </h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Dispute a punch or report an absence
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <SelectDefault
          label="Type"
          value={requestType}
          onChange={(event) =>
            onTypeChange(event.target.value as AttendanceRequestType)
          }
          options={[
            { value: "dispute", label: "Dispute" },
            { value: "absence", label: "Absence" },
          ]}
        />
        <InputDefault
          label="Date"
          type="date"
          value={requestDate}
          onChange={(event) => onDateChange(event.target.value)}
          required
        />
        <div className="flex flex-col gap-2">
          <label
            htmlFor="attendance-request-message"
            className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
          >
            Message
          </label>
          <textarea
            id="attendance-request-message"
            rows={4}
            value={requestMessage}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder={
              requestType === "dispute"
                ? "What looks wrong on this day?"
                : "Why were you absent?"
            }
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-[var(--surface-elevated)]"
            required
          />
        </div>

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        {success ? (
          <p className="text-sm text-[#15803d]">{success}</p>
        ) : null}

        <ButtonDefault type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit request"}
        </ButtonDefault>
      </form>
    </section>
  );
}

function RequestsPanel({
  requests,
  loading,
  error,
  compact = false,
}: {
  requests: AttendanceRequest[];
  loading: boolean;
  error: string | null;
  compact?: boolean;
}) {
  return (
    <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 shadow-[var(--shadow-soft)]">
      <header className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
          {compact ? "Your requests" : "Request status"}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Disputes and absences awaiting or reviewed by HR
        </p>
      </header>

      <div className="p-5">
        {error ? (
          <EmptyStateDefault title="Requests unavailable" description={error} />
        ) : loading ? (
          <LoadingDefault label="Loading requests" />
        ) : requests.length === 0 ? (
          <EmptyStateDefault
            title="No requests yet"
            description="Submit a dispute or absence above — status shows here."
          />
        ) : (
          <ul className="space-y-3">
            {requests.map((item) => (
              <RequestRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RequestRow({ item }: { item: AttendanceRequest }) {
  const statusTone =
    item.status === "approved" || item.status === "resolved"
      ? "bg-[#d8f3e5] text-[#15803d] border-[#8dceb0]"
      : item.status === "rejected"
        ? "bg-[#fde2e4] text-[#c1121f] border-[#e7a0a6]"
        : "bg-[#eef2f6] text-[#415664] border-[#c5d3de]";

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium capitalize text-[var(--foreground)]">
            {item.type} · {formatAttendanceDate(item.date)}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {item.message}
          </p>
          {item.admin_comment ? (
            <p className="mt-2 text-sm text-[var(--foreground)]">
              <span className="font-medium">HR: </span>
              {item.admin_comment}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
            statusTone,
          )}
        >
          {String(item.status).replaceAll("_", " ")}
        </span>
      </div>
    </li>
  );
}
