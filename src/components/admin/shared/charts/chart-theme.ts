"use client";

import { useTheme } from "@/context/theme-context";
import type { ApexOptions } from "apexcharts";

// Validated categorical palette (dataviz reference), stepped per theme.
// Order is fixed: slot 1 is always the first category, never cycled.
const PALETTE = {
  light: [
    "#2a78d6",
    "#eb6834",
    "#1baf7a",
    "#eda100",
    "#e87ba4",
    "#008300",
    "#6250d6",
    "#e34948",
  ],
  dark: [
    "#3987e5",
    "#d95926",
    "#199e70",
    "#c98500",
    "#d55181",
    "#008300",
    "#9085e9",
    "#e66767",
  ],
};

// Neutral for "Other" / "Not set" buckets so they never borrow a series hue.
const NEUTRAL = { light: "#98a2b3", dark: "#667085" };

export function useChartTheme() {
  const { theme } = useTheme();
  const mode = theme === "dark" ? "dark" : "light";
  const palette = PALETTE[mode];
  const text = mode === "dark" ? "#98A2B3" : "#667085";
  const grid = mode === "dark" ? "#1D2939" : "#F2F4F7";

  // Status colours are used the same way in every chart.
  const status = { pending: palette[1], confirmed: palette[2] };

  /** Colours for a list of category labels, keeping "Other"/"Not set" neutral. */
  const colorsFor = (labels: string[]) => {
    let slot = 0;
    return labels.map((l) =>
      l === "Other" || l === "Not set"
        ? NEUTRAL[mode]
        : palette[slot++ % palette.length],
    );
  };

  /** Shared ApexCharts defaults: font, no toolbar, recessive axes, tooltip theme. */
  const base: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode },
    dataLabels: { enabled: false },
    grid: { borderColor: grid, strokeDashArray: 0 },
    tooltip: { theme: mode },
    legend: {
      position: "bottom",
      fontFamily: "Outfit, sans-serif",
      labels: { colors: text },
      markers: { size: 6, shape: "circle" },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: text } },
    },
    yaxis: { labels: { style: { colors: [text] } } },
  };

  return { mode, palette, status, text, grid, base, colorsFor };
}

export const countFormatter = (v: number) =>
  `${v} ${v === 1 ? "inquiry" : "inquiries"}`;
