"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useSearchParams } from "next/navigation";
import AnimatedNumber from "@/components/UI/AnimatedNumber";
import ChartPanel from "@/components/UI/ChartPanel";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import SkeletonDefault from "@/components/UI/SkeletonDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import { useMyDailyMetrics, useMyMetrics } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";
import {
  barChartOptions,
  chartColors,
  doughnutOptions,
  lineChartOptions,
} from "@/lib/chart-theme";
import type { ClientEmployee, PerformancePeriod } from "@/lib/types";
import {
  formatMinutes,
  formatPersonName,
  formatShift,
  greetingForNow,
} from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const PERIOD_LABELS: Record<PerformancePeriod, string> = {
  day: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  custom: "Custom range",
};

export default function MyDayView() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "overview";
  const { period, setPeriod, custom, setCustom, range } =
    usePeriodRange("month");

  const metricsQuery = useMyMetrics(range.from, range.to);
  const dailyQuery = useMyDailyMetrics(range.from, range.to);
  const [employee, setEmployee] = useState<ClientEmployee | null>(null);

  useEffect(() => {
    setEmployee(authStorage.getEmployee());
  }, []);

  const isHr = employee?.department?.toLowerCase() === "hr";
  const metrics = metricsQuery.data;
  const daily = dailyQuery.data ?? [];
  const periodLabel = PERIOD_LABELS[period];

  const errorMessage =
    metricsQuery.error instanceof ApiError
      ? metricsQuery.error.message
      : metricsQuery.isError
        ? "Could not load your metrics."
        : null;

  const loading = metricsQuery.isLoading || dailyQuery.isLoading;

  const activityLine = {
    labels: daily.map((row) => row.date.slice(5)),
    datasets: [
      {
        label: "Calls",
        data: daily.map((row) => row.calls_made ?? 0),
        borderColor: chartColors.teal,
        backgroundColor: chartColors.tealSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
      {
        label: "Texts",
        data: daily.map((row) => row.messages_total ?? 0),
        borderColor: chartColors.slate,
        backgroundColor: chartColors.slateSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  };

  const volumeBars = {
    labels: ["Calls", "Talk min", "Texts out", "Texts in"],
    datasets: [
      {
        label: periodLabel,
        data: [
          metrics?.calls_made ?? 0,
          metrics?.minutes_on_call ?? 0,
          metrics?.messages_outbound ?? 0,
          metrics?.messages_inbound ?? 0,
        ],
        backgroundColor: [
          chartColors.teal,
          chartColors.slate,
          chartColors.sand,
          chartColors.green,
        ],
        borderRadius: 8,
      },
    ],
  };

  const pipelineDoughnut = {
    labels: ["Leads", "Follow-ups", "Hired", "Loaded", "Rejected"],
    datasets: [
      {
        data: [
          metrics?.leads ?? 0,
          metrics?.follow_up ?? 0,
          metrics?.hires ?? 0,
          metrics?.loaded ?? 0,
          metrics?.rejected ?? 0,
        ],
        backgroundColor: [
          chartColors.teal,
          chartColors.slate,
          chartColors.green,
          chartColors.sand,
          "#b42318",
        ],
        borderWidth: 0,
      },
    ],
  };

  const talkVsTexts = {
    labels: daily.map((row) => row.date.slice(5)),
    datasets: [
      {
        label: "Talk minutes",
        data: daily.map((row) => row.minutes_on_call ?? 0),
        borderColor: chartColors.teal,
        backgroundColor: chartColors.tealSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
      {
        label: "Texts total",
        data: daily.map((row) => row.messages_total ?? 0),
        borderColor: chartColors.slate,
        backgroundColor: "transparent",
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-7">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(135deg,#d5f0eb_0%,#d7e7f2_48%,#f5e8c7_100%)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Dashboard · {periodLabel}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              {greetingForNow()},{" "}
              {employee?.first_name ||
                formatPersonName(employee?.first_name, employee?.last_name)}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted-foreground)]">
              All numbers follow the Central Time date filter. Week = Mon→today
              CT, month = 1st→today CT. Counts and minutes only — never message
              content.
            </p>
          </div>

          <div className="animate-rise rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface-elevated)]/90 px-5 py-4 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Today&apos;s shift
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
              {formatShift(employee?.shift)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {[employee?.company, employee?.department, employee?.position]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      </section>

      <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-blue)]">
              Date filter · Central Time
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              America/Chicago · applies to every KPI and chart · {range.from} →{" "}
              {range.to}
            </p>
          </div>
        </div>
        <PeriodControls
          period={period}
          onPeriodChange={setPeriod}
          custom={custom}
          onCustomChange={setCustom}
        />
      </section>

      {errorMessage ? (
        <EmptyStateDefault
          title="Metrics unavailable"
          description={errorMessage}
        />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonDefault
              key={index}
              className="skeleton-shimmer h-32 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <>
          {(view === "overview" || view === "charts") && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCardDefault
                label="Calls"
                value={<AnimatedNumber value={metrics?.calls_made ?? 0} />}
                hint={periodLabel}
                accent="teal"
                style={{ animationDelay: "40ms" }}
              />
              <StatCardDefault
                label="Talk time"
                value={
                  <AnimatedNumber
                    value={metrics?.minutes_on_call ?? 0}
                    format={(n) => formatMinutes(n)}
                  />
                }
                hint={periodLabel}
                accent="slate"
                style={{ animationDelay: "90ms" }}
              />
              <StatCardDefault
                label="Texts sent"
                value={
                  <AnimatedNumber value={metrics?.messages_outbound ?? 0} />
                }
                hint={periodLabel}
                accent="sand"
                style={{ animationDelay: "140ms" }}
              />
              <StatCardDefault
                label="Texts received"
                value={
                  <AnimatedNumber value={metrics?.messages_inbound ?? 0} />
                }
                hint={periodLabel}
                accent="green"
                style={{ animationDelay: "190ms" }}
              />
            </div>
          )}

          {isHr && view === "overview" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(
                [
                  ["Leads", metrics?.leads ?? 0, "teal"],
                  ["Follow-ups", metrics?.follow_up ?? 0, "slate"],
                  ["Hired", metrics?.hires ?? 0, "green"],
                  ["Loaded", metrics?.loaded ?? 0, "sand"],
                  ["Rejected", metrics?.rejected ?? 0, "teal"],
                ] as const
              ).map(([label, value, accent], index) => (
                <StatCardDefault
                  key={label}
                  label={label}
                  value={<AnimatedNumber value={value} />}
                  hint={periodLabel}
                  accent={accent}
                  style={{ animationDelay: `${220 + index * 40}ms` }}
                />
              ))}
            </div>
          ) : null}

          {(view === "overview" || view === "charts") && (
            <>
              <div className="grid gap-4 xl:grid-cols-5">
                <ChartPanel
                  title="Activity trend"
                  hint={`Daily calls & texts · ${range.from} → ${range.to}`}
                  className="xl:col-span-3 border-[#9dbcd4] bg-[linear-gradient(180deg,#eef5fa_0%,#f7fafc_100%)]"
                  heightClassName="h-72"
                >
                  {daily.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <Line data={activityLine} options={lineChartOptions} />
                  )}
                </ChartPanel>
                <ChartPanel
                  title="Volume mix"
                  hint={periodLabel}
                  className="xl:col-span-2 border-[#9fd4cb] bg-[linear-gradient(180deg,#e8f7f3_0%,#f7fafc_100%)]"
                  heightClassName="h-72"
                >
                  <Bar
                    data={volumeBars}
                    options={{
                      ...barChartOptions,
                      plugins: {
                        ...barChartOptions.plugins,
                        legend: { display: false },
                      },
                    }}
                  />
                </ChartPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ChartPanel
                  title="Talk minutes vs texts"
                  hint="Daily aggregates — no content"
                  className="border-[#ddc58a] bg-[linear-gradient(180deg,#f8f1df_0%,#f7fafc_100%)]"
                  heightClassName="h-72"
                >
                  {daily.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <Line data={talkVsTexts} options={lineChartOptions} />
                  )}
                </ChartPanel>
                {isHr ? (
                  <ChartPanel
                    title="Pipeline mix"
                    hint={`Your Monday statuses · ${periodLabel}`}
                    className="border-[#8dceb0] bg-[linear-gradient(180deg,#e6f6ee_0%,#f7fafc_100%)]"
                    heightClassName="h-72"
                  >
                    <Doughnut
                      data={pipelineDoughnut}
                      options={doughnutOptions}
                    />
                  </ChartPanel>
                ) : (
                  <ChartPanel
                    title="Safety note"
                    hint="Monitoring stays in Admin"
                    heightClassName="h-72"
                  >
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm leading-6 text-[var(--muted-foreground)]">
                      Personal counts only — never cameras or peer alerts.
                    </div>
                  </ChartPanel>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
      No daily rows in this range.
    </div>
  );
}
