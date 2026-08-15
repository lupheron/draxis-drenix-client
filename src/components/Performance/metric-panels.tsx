"use client";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import AnimatedNumber from "@/components/UI/AnimatedNumber";
import ChartPanel from "@/components/UI/ChartPanel";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import StatCardDefault from "@/components/UI/StatCardDefault";
import {
  barChartOptions,
  chartColors,
  doughnutOptions,
  lineChartOptions,
  pipelinePalette,
  stackedBarOptions,
} from "@/lib/chart-theme";
import type { DailyMetric, EmployeeMetrics } from "@/lib/types";
import { formatMinutes, formatNumber } from "@/utils/formatters";

type PanelProps = {
  totals: EmployeeMetrics;
  rows: DailyMetric[];
  includeLeads?: boolean;
};

function average(total: number, days: number) {
  return days ? Math.round(total / days) : 0;
}

function ratePct(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function lineSet(
  label: string,
  data: number[],
  color: string,
  soft: string,
  fill = false,
) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: fill ? soft : "transparent",
    fill,
    tension: 0.35,
    pointRadius: 2,
    borderWidth: 2.5,
  };
}

export function RingCentralPanel({ totals, rows }: PanelProps) {
  const labels = rows.map((row) => row.date.slice(5));
  const days = rows.length;
  const hasCallSplit =
    totals.outbound_calls != null ||
    totals.inbound_calls != null ||
    totals.missed_calls != null;

  const callsVsTalk = {
    labels,
    datasets: [
      lineSet(
        "Calls",
        rows.map((row) => row.calls_made ?? 0),
        chartColors.red,
        chartColors.redSoft,
        true,
      ),
      lineSet(
        "Talk minutes",
        rows.map((row) => row.minutes_on_call ?? 0),
        chartColors.blue,
        chartColors.blueSoft,
      ),
    ],
  };

  const textsLine = {
    labels,
    datasets: [
      lineSet(
        "Sent",
        rows.map((row) => row.messages_outbound ?? 0),
        chartColors.orange,
        chartColors.orangeSoft,
        true,
      ),
      lineSet(
        "Received",
        rows.map((row) => row.messages_inbound ?? 0),
        chartColors.green,
        chartColors.greenSoft,
      ),
    ],
  };

  const dailyVolume = {
    labels,
    datasets: [
      {
        label: "Calls",
        data: rows.map((row) => row.calls_made ?? 0),
        backgroundColor: chartColors.red,
        borderRadius: 6,
      },
      {
        label: "Texts",
        data: rows.map((row) => row.messages_total ?? 0),
        backgroundColor: chartColors.blue,
        borderRadius: 6,
      },
    ],
  };

  const textMix = {
    labels: ["Sent", "Received"],
    datasets: [
      {
        data: [totals.messages_outbound ?? 0, totals.messages_inbound ?? 0],
        backgroundColor: [chartColors.orange, chartColors.green],
        borderWidth: 0,
      },
    ],
  };

  const periodMix = {
    labels: ["Calls", "Talk min", "Texts out", "Texts in"],
    datasets: [
      {
        label: "Period totals",
        data: [
          totals.calls_made ?? 0,
          totals.minutes_on_call ?? 0,
          totals.messages_outbound ?? 0,
          totals.messages_inbound ?? 0,
        ],
        backgroundColor: [
          chartColors.red,
          chartColors.blue,
          chartColors.orange,
          chartColors.green,
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          label="Calls"
          value={<AnimatedNumber value={totals.calls_made ?? 0} />}
          accent="red"
        />
        <StatCardDefault
          label="Talk time"
          value={
            <AnimatedNumber
              value={totals.minutes_on_call ?? 0}
              format={(n) => formatMinutes(n)}
            />
          }
          accent="blue"
        />
        <StatCardDefault
          label="Texts sent"
          value={<AnimatedNumber value={totals.messages_outbound ?? 0} />}
          accent="orange"
        />
        <StatCardDefault
          label="Texts received"
          value={<AnimatedNumber value={totals.messages_inbound ?? 0} />}
          accent="green"
        />
        <StatCardDefault
          label="Total texts"
          value={<AnimatedNumber value={totals.messages_total ?? 0} />}
          accent="gold"
        />
        <StatCardDefault
          label="Avg calls / day"
          value={formatNumber(average(totals.calls_made ?? 0, days))}
          accent="red"
        />
        <StatCardDefault
          label="Avg talk / day"
          value={formatMinutes(average(totals.minutes_on_call ?? 0, days))}
          accent="blue"
        />
        <StatCardDefault
          label="Avg texts / day"
          value={formatNumber(average(totals.messages_total ?? 0, days))}
          accent="orange"
        />
        {hasCallSplit ? (
          <>
            <StatCardDefault
              label="Outbound calls"
              value={
                <AnimatedNumber value={totals.outbound_calls ?? 0} />
              }
              accent="red"
            />
            <StatCardDefault
              label="Inbound calls"
              value={<AnimatedNumber value={totals.inbound_calls ?? 0} />}
              accent="blue"
            />
            <StatCardDefault
              label="Missed calls"
              value={<AnimatedNumber value={totals.missed_calls ?? 0} />}
              accent="gold"
            />
          </>
        ) : null}
        {totals.conversations_count != null ? (
          <StatCardDefault
            label="Conversations"
            value={<AnimatedNumber value={totals.conversations_count} />}
            accent="green"
          />
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyStateDefault
          title="No RingCentral activity in this range"
          description="Try a wider period, or check that sync is attributing work to your account."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title="Calls vs talk time"
            hint="Red = calls · Blue = minutes"
            heightClassName="h-72"
          >
            <Line data={callsVsTalk} options={lineChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Texts sent vs received"
            hint="Orange = sent · Green = received"
            heightClassName="h-72"
          >
            <Line data={textsLine} options={lineChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Daily calls and texts"
            hint="Grouped daily volume"
            heightClassName="h-72"
          >
            <Bar data={dailyVolume} options={barChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Text mix"
            hint="Period totals"
            heightClassName="h-72"
          >
            <Doughnut data={textMix} options={doughnutOptions} />
          </ChartPanel>
          <ChartPanel
            title="Period volume mix"
            hint="Calls, talk minutes, and texts"
            className="lg:col-span-2"
            heightClassName="h-72"
          >
            <Bar
              data={periodMix}
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
      )}
    </>
  );
}

export function LeadsPanel({ totals, rows }: PanelProps) {
  const labels = rows.map((row) => row.date.slice(5));
  const days = rows.length;
  const leadTotal = totals.leads ?? 0;

  const pipelineLine = {
    labels,
    datasets: [
      lineSet(
        "Leads",
        rows.map((row) => row.leads ?? 0),
        chartColors.orange,
        chartColors.orangeSoft,
        true,
      ),
      lineSet(
        "Follow-ups",
        rows.map((row) => row.follow_up ?? 0),
        chartColors.blue,
        chartColors.blueSoft,
      ),
      lineSet(
        "Hired",
        rows.map((row) => row.hires ?? 0),
        chartColors.green,
        chartColors.greenSoft,
      ),
      lineSet(
        "Loaded",
        rows.map((row) => row.loaded ?? 0),
        chartColors.gold,
        chartColors.goldSoft,
      ),
      lineSet(
        "Rejected",
        rows.map((row) => row.rejected ?? 0),
        chartColors.red,
        chartColors.redSoft,
      ),
    ],
  };

  const pipelineBars = {
    labels,
    datasets: [
      {
        label: "Leads",
        data: rows.map((row) => row.leads ?? 0),
        backgroundColor: chartColors.orange,
        borderRadius: 4,
      },
      {
        label: "Follow-ups",
        data: rows.map((row) => row.follow_up ?? 0),
        backgroundColor: chartColors.blue,
        borderRadius: 4,
      },
      {
        label: "Hired",
        data: rows.map((row) => row.hires ?? 0),
        backgroundColor: chartColors.green,
        borderRadius: 4,
      },
      {
        label: "Loaded",
        data: rows.map((row) => row.loaded ?? 0),
        backgroundColor: chartColors.gold,
        borderRadius: 4,
      },
      {
        label: "Rejected",
        data: rows.map((row) => row.rejected ?? 0),
        backgroundColor: chartColors.red,
        borderRadius: 4,
      },
    ],
  };

  const pipelineMix = {
    labels: ["Leads", "Follow-ups", "Hired", "Loaded", "Rejected"],
    datasets: [
      {
        data: [
          totals.leads ?? 0,
          totals.follow_up ?? 0,
          totals.hires ?? 0,
          totals.loaded ?? 0,
          totals.rejected ?? 0,
        ],
        backgroundColor: pipelinePalette,
        borderWidth: 0,
      },
    ],
  };

  const conversion = {
    labels,
    datasets: [
      lineSet(
        "Leads",
        rows.map((row) => row.leads ?? 0),
        chartColors.orange,
        chartColors.orangeSoft,
        true,
      ),
      lineSet(
        "Hired",
        rows.map((row) => row.hires ?? 0),
        chartColors.green,
        chartColors.greenSoft,
      ),
    ],
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          label="Leads"
          value={<AnimatedNumber value={totals.leads ?? 0} />}
          accent="orange"
        />
        <StatCardDefault
          label="Follow-ups"
          value={<AnimatedNumber value={totals.follow_up ?? 0} />}
          accent="blue"
        />
        <StatCardDefault
          label="Hired"
          value={<AnimatedNumber value={totals.hires ?? 0} />}
          accent="green"
        />
        <StatCardDefault
          label="Loaded"
          value={<AnimatedNumber value={totals.loaded ?? 0} />}
          accent="gold"
        />
        <StatCardDefault
          label="Rejected"
          value={<AnimatedNumber value={totals.rejected ?? 0} />}
          accent="red"
        />
        <StatCardDefault
          label="Hire rate"
          value={ratePct(totals.hires ?? 0, leadTotal)}
          hint="Hired / leads"
          accent="green"
        />
        <StatCardDefault
          label="Loaded rate"
          value={ratePct(totals.loaded ?? 0, leadTotal)}
          hint="Loaded / leads"
          accent="gold"
        />
        <StatCardDefault
          label="Avg leads / day"
          value={formatNumber(average(leadTotal, days))}
          accent="orange"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyStateDefault
          title="No lead activity in this range"
          description="When Monday sync attributes pipeline work to you, charts will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title="Pipeline over time"
            hint="Orange / blue / green / gold / red"
            className="lg:col-span-2"
            heightClassName="h-72"
          >
            <Line data={pipelineLine} options={lineChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Daily pipeline volume"
            hint="Grouped by status"
            heightClassName="h-72"
          >
            <Bar data={pipelineBars} options={barChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Pipeline mix"
            hint="Period totals"
            heightClassName="h-72"
          >
            <Doughnut data={pipelineMix} options={doughnutOptions} />
          </ChartPanel>
          <ChartPanel
            title="Leads vs hired"
            hint="Orange = leads · Green = hired"
            className="lg:col-span-2"
            heightClassName="h-72"
          >
            <Line data={conversion} options={lineChartOptions} />
          </ChartPanel>
        </div>
      )}
    </>
  );
}

export function MixedPanel({ totals, rows, includeLeads = true }: PanelProps) {
  const labels = rows.map((row) => row.date.slice(5));

  const callsVsLeads = {
    labels,
    datasets: [
      lineSet(
        "Calls",
        rows.map((row) => row.calls_made ?? 0),
        chartColors.red,
        chartColors.redSoft,
        true,
      ),
      includeLeads
        ? lineSet(
            "Leads",
            rows.map((row) => row.leads ?? 0),
            chartColors.blue,
            chartColors.blueSoft,
          )
        : lineSet(
            "Texts",
            rows.map((row) => row.messages_total ?? 0),
            chartColors.blue,
            chartColors.blueSoft,
          ),
    ],
  };

  const textsVsHires = {
    labels,
    datasets: [
      lineSet(
        "Texts",
        rows.map((row) => row.messages_total ?? 0),
        chartColors.orange,
        chartColors.orangeSoft,
        true,
      ),
      includeLeads
        ? lineSet(
            "Hired",
            rows.map((row) => row.hires ?? 0),
            chartColors.green,
            chartColors.greenSoft,
          )
        : lineSet(
            "Talk minutes",
            rows.map((row) => row.minutes_on_call ?? 0),
            chartColors.green,
            chartColors.greenSoft,
          ),
    ],
  };

  const stacked = {
    labels,
    datasets: [
      {
        label: "Calls",
        data: rows.map((row) => row.calls_made ?? 0),
        backgroundColor: chartColors.red,
        stack: "mix",
      },
      {
        label: "Texts",
        data: rows.map((row) => row.messages_total ?? 0),
        backgroundColor: chartColors.blue,
        stack: "mix",
      },
    ],
  };

  const activityMix = {
    labels: includeLeads
      ? ["Calls", "Texts", "Leads", "Hired"]
      : ["Calls", "Talk min", "Texts out", "Texts in"],
    datasets: [
      {
        data: includeLeads
          ? [
              totals.calls_made ?? 0,
              totals.messages_total ?? 0,
              totals.leads ?? 0,
              totals.hires ?? 0,
            ]
          : [
              totals.calls_made ?? 0,
              totals.minutes_on_call ?? 0,
              totals.messages_outbound ?? 0,
              totals.messages_inbound ?? 0,
            ],
        backgroundColor: [
          chartColors.red,
          chartColors.blue,
          chartColors.orange,
          chartColors.green,
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardDefault
          label="Calls"
          value={<AnimatedNumber value={totals.calls_made ?? 0} />}
          accent="red"
        />
        <StatCardDefault
          label="Texts"
          value={<AnimatedNumber value={totals.messages_total ?? 0} />}
          accent="blue"
        />
        {includeLeads ? (
          <>
            <StatCardDefault
              label="Leads"
              value={<AnimatedNumber value={totals.leads ?? 0} />}
              accent="orange"
            />
            <StatCardDefault
              label="Hired"
              value={<AnimatedNumber value={totals.hires ?? 0} />}
              accent="green"
            />
          </>
        ) : (
          <>
            <StatCardDefault
              label="Talk time"
              value={
                <AnimatedNumber
                  value={totals.minutes_on_call ?? 0}
                  format={(n) => formatMinutes(n)}
                />
              }
              accent="orange"
            />
            <StatCardDefault
              label="Texts received"
              value={<AnimatedNumber value={totals.messages_inbound ?? 0} />}
              accent="green"
            />
          </>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyStateDefault
          title="No activity in this range"
          description="Try a wider period to compare RingCentral and pipeline together."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title={includeLeads ? "Calls vs leads" : "Calls vs texts"}
            hint={
              includeLeads
                ? "Red = calls · Blue = leads"
                : "Red = calls · Blue = texts"
            }
            heightClassName="h-72"
          >
            <Line data={callsVsLeads} options={lineChartOptions} />
          </ChartPanel>
          <ChartPanel
            title={includeLeads ? "Texts vs hired" : "Texts vs talk time"}
            hint={
              includeLeads
                ? "Orange = texts · Green = hired"
                : "Orange = texts · Green = minutes"
            }
            heightClassName="h-72"
          >
            <Line data={textsVsHires} options={lineChartOptions} />
          </ChartPanel>
          <ChartPanel
            title="Daily RingCentral volume"
            hint="Stacked calls + texts"
            heightClassName="h-72"
          >
            <Bar data={stacked} options={stackedBarOptions} />
          </ChartPanel>
          <ChartPanel
            title="Activity mix"
            hint={
              includeLeads
                ? "Calls, texts, leads, hired"
                : "Calls, talk minutes, and texts"
            }
            heightClassName="h-72"
          >
            <Doughnut data={activityMix} options={doughnutOptions} />
          </ChartPanel>
        </div>
      )}
    </>
  );
}
