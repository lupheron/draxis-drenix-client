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
import { useSearchParams } from "next/navigation";
import LeadsTableView from "@/components/Leads/LeadsTableView";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import LoadingDefault from "@/components/UI/LoadingDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import { LeadsPanel } from "@/components/Performance/metric-panels";
import { useMyDailyMetrics, useMyMetrics } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

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

export default function LeadsView() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "overview";

  if (view === "table") {
    return <LeadsTableView />;
  }

  return <LeadsOverview />;
}

function LeadsOverview() {
  const { period, setPeriod, custom, setCustom, range } = usePeriodRange("month");
  const dailyQuery = useMyDailyMetrics(range.from, range.to);
  const totalsQuery = useMyMetrics(range.from, range.to);

  const rows = dailyQuery.data ?? [];
  const totals = totalsQuery.data;
  const errorMessage =
    dailyQuery.error instanceof ApiError
      ? dailyQuery.error.message
      : totalsQuery.error instanceof ApiError
        ? totalsQuery.error.message
        : dailyQuery.isError || totalsQuery.isError
          ? "Could not load your lead statistics."
          : null;

  const loading = dailyQuery.isLoading || totalsQuery.isLoading;

  return (
    <div className="flex flex-col gap-8">
      <section className="animate-fade-in">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          My Leads
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          Pipeline statistics
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Counts and trends for leads attributed to you. Open{" "}
          <span className="font-medium text-[var(--foreground)]">Leads table</span>{" "}
          for your Monday New / Follow up boards.
        </p>
      </section>

      <PeriodControls
        period={period}
        onPeriodChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />
      <p className="-mt-5 text-xs text-[var(--muted)]">
        America/Chicago (Central Time)
      </p>

      {errorMessage ? (
        <EmptyStateDefault title="Leads unavailable" description={errorMessage} />
      ) : loading || !totals ? (
        <LoadingDefault label="Loading your lead statistics" />
      ) : (
        <LeadsPanel totals={totals} rows={rows} />
      )}
    </div>
  );
}
