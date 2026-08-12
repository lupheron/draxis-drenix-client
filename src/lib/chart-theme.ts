import type { ChartOptions } from "chart.js";

export const chartColors = {
  teal: "#1a6f66",
  tealSoft: "rgba(26, 111, 102, 0.14)",
  slate: "#2f5d7c",
  slateSoft: "rgba(47, 93, 124, 0.12)",
  sand: "#8a6a3d",
  sandSoft: "rgba(138, 106, 61, 0.12)",
  green: "#067647",
  greenSoft: "rgba(6, 118, 71, 0.12)",
  muted: "#6a7c89",
  grid: "rgba(180, 196, 207, 0.35)",
};

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
