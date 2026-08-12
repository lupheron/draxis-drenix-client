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
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useSearchParams } from "next/navigation";
import ChartPanel from "@/components/UI/ChartPanel";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import SkeletonDefault from "@/components/UI/SkeletonDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import AnimatedNumber from "@/components/UI/AnimatedNumber";
import { useMyDailyMetrics, useMyMetrics } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";
import {
  chartColors,
  doughnutOptions,
  lineChartOptions,
  stackedBarOptions,
} from "@/lib/chart-theme";
import { formatMinutes, formatNumber } from "@/utils/formatters";

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

export default function PerformanceView() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "trends";
  const { period, setPeriod, custom, setCustom, range } = usePeriodRange("month");
  const dailyQuery = useMyDailyMetrics(range.from, range.to);
  const totalsQuery = useMyMetrics(range.from, range.to);
  const [isHr, setIsHr] = useState(false);

  useEffect(() => {
    setIsHr(authStorage.isHr());
  }, []);

  const rows = dailyQuery.data ?? [];
  const labels = rows.map((row) => row.date.slice(5));
  const totals = totalsQuery.data;

  const errorMessage =
    dailyQuery.error instanceof ApiError
      ? dailyQuery.error.message
      : dailyQuery.isError
        ? "Could not load your performance series."
        : null;

  const callsLine = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Calls",
          data: rows.map((row) => row.calls_made ?? 0),
          borderColor: chartColors.teal,
          backgroundColor: chartColors.tealSoft,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Talk minutes",
          data: rows.map((row) => row.minutes_on_call ?? 0),
          borderColor: chartColors.slate,
          backgroundColor: "transparent",
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }),
    [labels, rows],
  );

  const messagesLine = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Sent",
          data: rows.map((row) => row.messages_outbound ?? 0),
          borderColor: chartColors.slate,
          backgroundColor: chartColors.slateSoft,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Received",
          data: rows.map((row) => row.messages_inbound ?? 0),
          borderColor: chartColors.sand,
          backgroundColor: "transparent",
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }),
    [labels, rows],
  );

  const pipelineLine = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Leads",
          data: rows.map((row) => row.leads ?? 0),
          borderColor: chartColors.teal,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Follow-ups",
          data: rows.map((row) => row.follow_up ?? 0),
          borderColor: chartColors.slate,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Hired",
          data: rows.map((row) => row.hires ?? 0),
          borderColor: chartColors.green,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Loaded",
          data: rows.map((row) => row.loaded ?? 0),
          borderColor: chartColors.sand,
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }),
    [labels, rows],
  );

  const stackedBars = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Calls",
          data: rows.map((row) => row.calls_made ?? 0),
          backgroundColor: chartColors.teal,
          stack: "a",
        },
        {
          label: "Texts",
          data: rows.map((row) => row.messages_total ?? 0),
          backgroundColor: chartColors.slate,
          stack: "a",
        },
      ],
    }),
    [labels, rows],
  );

  const doughnut = useMemo(
    () => ({
      labels: ["Leads", "Follow-ups", "Hired", "Loaded", "Rejected"],
      datasets: [
        {
          data: [
            totals?.leads ?? 0,
            totals?.follow_up ?? 0,
            totals?.hires ?? 0,
            totals?.loaded ?? 0,
            totals?.rejected ?? 0,
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
    }),
    [totals],
  );

  return (
    <div className="flex flex-col gap-7">
      <section className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Performance
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          {view === "calls"
            ? "Call activity"
            : view === "messages"
              ? "Message volume"
              : view === "pipeline"
                ? "Pipeline trend"
                : "Your trends"}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Self-only charts — aggregates and counts. No transcripts, no SMS
          bodies, no peer boards.
        </p>
      </section>

      <PeriodControls
        period={period}
        onPeriodChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />
      <p className="-mt-4 text-xs text-[var(--muted)]">
        Ranges use America/Chicago (Central Time), not browser local time.
      </p>

      {!totalsQuery.isLoading && totals ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardDefault
            label="Calls"
            value={<AnimatedNumber value={totals.calls_made ?? 0} />}
            accent="teal"
          />
          <StatCardDefault
            label="Talk time"
            value={
              <AnimatedNumber
                value={totals.minutes_on_call ?? 0}
                format={(n) => formatMinutes(n)}
              />
            }
            accent="slate"
          />
          <StatCardDefault
            label="Texts"
            value={<AnimatedNumber value={totals.messages_total ?? 0} />}
            accent="sand"
          />
          <StatCardDefault
            label="Avg texts / day"
            value={formatNumber(
              rows.length
                ? Math.round((totals.messages_total ?? 0) / rows.length)
                : 0,
            )}
            accent="green"
          />
        </div>
      ) : null}

      {errorMessage ? (
        <EmptyStateDefault title="Charts unavailable" description={errorMessage} />
      ) : dailyQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonDefault className="skeleton-shimmer h-72 rounded-2xl" />
          <SkeletonDefault className="skeleton-shimmer h-72 rounded-2xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyStateDefault
          title="No activity in this range"
          description="Try a wider period, or check that sync is attributing work to your account."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(view === "trends" || view === "calls") && (
            <ChartPanel
              title="Calls & talk minutes"
              hint="Daily counts only"
              className={view === "calls" ? "lg:col-span-2" : undefined}
              heightClassName="h-72"
            >
              <Line data={callsLine} options={lineChartOptions} />
            </ChartPanel>
          )}

          {(view === "trends" || view === "messages") && (
            <ChartPanel
              title="Messages sent vs received"
              hint="Volume only — no thread content"
              className={view === "messages" ? "lg:col-span-2" : undefined}
              heightClassName="h-72"
            >
              <Line data={messagesLine} options={lineChartOptions} />
            </ChartPanel>
          )}

          {view === "trends" ? (
            <ChartPanel
              title="Stacked daily volume"
              hint="Calls + texts per day"
              className="lg:col-span-2"
              heightClassName="h-72"
            >
              <Bar data={stackedBars} options={stackedBarOptions} />
            </ChartPanel>
          ) : null}

          {isHr && (view === "trends" || view === "pipeline") ? (
            <>
              <ChartPanel
                title="Pipeline over time"
                hint="Your Monday statuses"
                heightClassName="h-72"
              >
                <Line data={pipelineLine} options={lineChartOptions} />
              </ChartPanel>
              <ChartPanel
                title="Pipeline mix"
                hint="Period totals"
                heightClassName="h-72"
              >
                <Doughnut data={doughnut} options={doughnutOptions} />
              </ChartPanel>
            </>
          ) : null}

          {view === "pipeline" && !isHr ? (
            <EmptyStateDefault
              title="Pipeline is HR-only"
              description="Safety accounts use Dashboard and Performance call/message views."
              className="lg:col-span-2"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
