import type { ChartOptions } from "chart.js";

/** High-contrast pairs: red/blue, orange/green, gold/navy. */
export const chartColors = {
  red: "#c1121f",
  redSoft: "rgba(193, 18, 31, 0.16)",
  blue: "#1d4ed8",
  blueSoft: "rgba(29, 78, 216, 0.14)",
  orange: "#ea580c",
  orangeSoft: "rgba(234, 88, 12, 0.16)",
  green: "#15803d",
  greenSoft: "rgba(21, 128, 61, 0.14)",
  gold: "#ca8a04",
  goldSoft: "rgba(202, 138, 4, 0.16)",
  navy: "#0f3d6e",
  navySoft: "rgba(15, 61, 110, 0.12)",
  teal: "#1a6f66",
  tealSoft: "rgba(26, 111, 102, 0.14)",
  slate: "#1d4ed8",
  slateSoft: "rgba(29, 78, 216, 0.14)",
  sand: "#ea580c",
  sandSoft: "rgba(234, 88, 12, 0.16)",
  muted: "#6a7c89",
  grid: "rgba(180, 196, 207, 0.35)",
};

export const pipelinePalette = [
  chartColors.orange,
  chartColors.blue,
  chartColors.green,
  chartColors.gold,
  chartColors.red,
];

const sharedPlugins = {
  legend: {
    labels: {
      color: "#415664",
      boxWidth: 10,
      font: { size: 12, family: "Source Sans 3, sans-serif" },
    },
  },
  tooltip: {
    backgroundColor: "#12202a",
    titleColor: "#fff",
    bodyColor: "#e8eef4",
    padding: 10,
    cornerRadius: 8,
  },
};

const sharedScales = {
  x: {
    ticks: { color: "#6a7c89", maxRotation: 0 },
    grid: { color: chartColors.grid },
  },
  y: {
    beginAtZero: true,
    ticks: { color: "#6a7c89" },
    grid: { color: chartColors.grid },
  },
};

export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 900,
    easing: "easeOutQuart",
  },
  plugins: sharedPlugins,
  scales: sharedScales,
};

export const barChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 900,
    easing: "easeOutQuart",
  },
  plugins: sharedPlugins,
  scales: sharedScales,
};

export const stackedBarOptions: ChartOptions<"bar"> = {
  ...barChartOptions,
  scales: {
    x: { ...sharedScales.x, stacked: true },
    y: { ...sharedScales.y, stacked: true },
  },
};

export const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  animation: {
    animateRotate: true,
    duration: 1100,
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#415664",
        boxWidth: 10,
        font: { size: 12, family: "Source Sans 3, sans-serif" },
        padding: 14,
      },
    },
    tooltip: sharedPlugins.tooltip,
  },
};
