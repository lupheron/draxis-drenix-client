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
import { useSearchParams } from "next/navigation";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import LoadingDefault from "@/components/UI/LoadingDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import {
  LeadsPanel,
  MixedPanel,
  RingCentralPanel,
} from "@/components/Performance/metric-panels";
import { useMyDailyMetrics, useMyMetrics } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";

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

type PerformanceViewId = "ringcentral" | "leads" | "mixed";

function resolveView(raw: string | null): PerformanceViewId {
  if (raw === "leads" || raw === "pipeline") return "leads";
  if (raw === "mixed") return "mixed";
  return "ringcentral";
}

const COPY: Record<
  PerformanceViewId,
  { title: string; body: string }
> = {
  ringcentral: {
    title: "RingCentral",
    body: "Calls, talk time, and texts for this period — counts and minutes only.",
  },
  leads: {
    title: "Leads",
    body: "Pipeline statistics from Monday — totals and trends, not individual records.",
  },
  mixed: {
    title: "RingCentral & leads",
    body: "Calls, texts, and pipeline together so you can compare activity at a glance.",
  },
};

export default function PerformanceView() {
  const searchParams = useSearchParams();
  const { period, setPeriod, custom, setCustom, range } = usePeriodRange("month");
  const dailyQuery = useMyDailyMetrics(range.from, range.to);
  const totalsQuery = useMyMetrics(range.from, range.to);
  const [isHr, setIsHr] = useState(false);
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    setIsHr(authStorage.isHr());
    setRoleReady(true);
  }, []);

  const view = resolveView(searchParams.get("view"));
  const rows = dailyQuery.data ?? [];
  const totals = totalsQuery.data;
  const copy =
    view === "mixed" && roleReady && !isHr
      ? {
          title: "Mixed activity",
          body: "Calls and texts together so you can compare RingCentral volume at a glance.",
        }
      : COPY[view];

  const errorMessage =
    dailyQuery.error instanceof ApiError
      ? dailyQuery.error.message
      : totalsQuery.error instanceof ApiError
        ? totalsQuery.error.message
        : dailyQuery.isError || totalsQuery.isError
          ? "Could not load your performance."
          : null;

  const loading = dailyQuery.isLoading || totalsQuery.isLoading;

  return (
    <div className="flex flex-col gap-7">
      <section className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Performance
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          {copy.body}
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

      {errorMessage ? (
        <EmptyStateDefault title="Charts unavailable" description={errorMessage} />
      ) : loading || !totals || (view === "leads" && !roleReady) ? (
        <LoadingDefault label="Loading your performance" />
      ) : view === "leads" && !isHr ? (
        <EmptyStateDefault
          title="Pipeline is HR-only"
          description="Safety accounts use RingCentral and Mixed views."
        />
      ) : view === "leads" ? (
        <LeadsPanel totals={totals} rows={rows} />
      ) : view === "mixed" ? (
        <MixedPanel totals={totals} rows={rows} includeLeads={isHr} />
      ) : (
        <RingCentralPanel totals={totals} rows={rows} />
      )}
    </div>
  );
}
