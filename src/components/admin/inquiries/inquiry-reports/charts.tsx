"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ChartCard from "@/components/admin/shared/charts/chart-card";
import {
  countFormatter,
  useChartTheme,
} from "@/components/admin/shared/charts/chart-theme";
import type { Series } from "./utils";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CardProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Area chart: one series over time. */
export function TrendAreaChart({
  labels,
  values,
  ...card
}: CardProps & Series) {
  const { base, palette, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "area" },
    colors: [palette[0]],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0.02 },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: "transparent",
      hover: { size: 6 },
    },
    xaxis: { ...base.xaxis, categories: labels },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: [text] },
        formatter: (v) => String(Math.round(v)),
      },
    },
    tooltip: { ...base.tooltip, y: { formatter: countFormatter } },
  };
  return (
    <ChartCard {...card} empty={!sum(values)}>
      <ReactApexChart
        options={options}
        series={[{ name: "Inquiries", data: values }]}
        type="area"
        height={300}
      />
    </ChartCard>
  );
}

/** Radial meter: one ratio against 100%. */
export function ConversionRadial({
  rate,
  confirmed,
  total,
  ...card
}: CardProps & { rate: number; confirmed: number; total: number }) {
  const { base, status, grid, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "radialBar", sparkline: { enabled: true } },
    colors: [status.confirmed],
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: "66%" },
        track: { background: grid, strokeWidth: "100%" },
        dataLabels: {
          name: { show: true, offsetY: 28, color: text, fontSize: "13px" },
          value: {
            offsetY: -12,
            fontSize: "32px",
            fontWeight: 600,
            color: undefined,
            formatter: (v) => `${Math.round(Number(v))}%`,
          },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Confirmed"],
  };
  return (
    <ChartCard {...card} empty={!total}>
      <ReactApexChart
        options={options}
        series={[rate]}
        type="radialBar"
        height={260}
      />
      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {confirmed}
        </span>{" "}
        of {total} inquiries confirmed
      </p>
    </ChartCard>
  );
}

/** Stacked columns: Pending vs Confirmed for each period. */
export function StatusStackedColumns({
  labels,
  pending,
  confirmed,
  horizontal,
  height = 300,
  ...card
}: CardProps & {
  labels: string[];
  pending: number[];
  confirmed: number[];
  horizontal?: boolean;
  height?: number;
}) {
  const { base, status, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "bar", stacked: true },
    colors: [status.pending, status.confirmed],
    plotOptions: {
      bar: {
        horizontal,
        columnWidth: "45%",
        barHeight: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    // 2px surface-coloured gap between stacked segments.
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { ...base.xaxis, categories: labels },
    yaxis: { labels: { style: { colors: [text] }, maxWidth: 160 } },
    grid: {
      ...base.grid,
      xaxis: { lines: { show: Boolean(horizontal) } },
      yaxis: { lines: { show: !horizontal } },
    },
    tooltip: {
      ...base.tooltip,
      shared: true,
      intersect: false,
      y: { formatter: countFormatter },
    },
  };
  return (
    <ChartCard {...card} empty={!sum(pending) && !sum(confirmed)}>
      <ReactApexChart
        options={options}
        series={[
          { name: "Pending", data: pending },
          { name: "Confirmed", data: confirmed },
        ]}
        type="bar"
        height={height}
      />
    </ChartCard>
  );
}

/** Donut / pie: share of a whole (<= 6 slices + "Other"), with % labels on the slices. */
export function ShareChart({
  labels,
  values,
  kind = "donut",
  ...card
}: CardProps & Series & { kind?: "donut" | "pie" }) {
  const { base, colorsFor, mode } = useChartTheme();
  const total = sum(values);
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: kind },
    colors: colorsFor(labels),
    labels,
    stroke: { width: 2, colors: [mode === "dark" ? "#101828" : "#ffffff"] },
    dataLabels: {
      enabled: true,
      style: { fontSize: "12px", fontWeight: 600 },
      dropShadow: { enabled: false },
      formatter: (v: number) => (v >= 5 ? `${Math.round(v)}%` : ""),
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: kind === "donut",
            total: {
              show: true,
              label: "Total",
              formatter: () => String(total),
            },
          },
        },
      },
    },
    legend: {
      ...base.legend,
      formatter: (name: string, opts?: { seriesIndex: number }) =>
        `${name} (${opts ? values[opts.seriesIndex] : ""})`,
    },
    tooltip: { ...base.tooltip, y: { formatter: countFormatter } },
  };
  return (
    <ChartCard {...card} empty={!total}>
      <ReactApexChart
        options={options}
        series={values}
        type={kind}
        height={320}
      />
    </ChartCard>
  );
}

/** Ranked horizontal bars, one hue (the axis labels name each bar). */
export function RankedBars({
  labels,
  values,
  colorSlot = 6,
  ...card
}: CardProps & Series & { colorSlot?: number }) {
  const { base, palette, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "bar" },
    colors: [palette[colorSlot]],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 6,
      style: { fontSize: "12px", fontWeight: 600, colors: [text] },
    },
    xaxis: {
      ...base.xaxis,
      categories: labels,
      labels: {
        style: { colors: text },
        formatter: (v) => String(Math.round(Number(v))),
      },
    },
    yaxis: { labels: { style: { colors: [text] }, maxWidth: 180 } },
    grid: {
      ...base.grid,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: { ...base.tooltip, y: { formatter: countFormatter } },
  };
  return (
    <ChartCard {...card} empty={!sum(values)}>
      <ReactApexChart
        options={options}
        series={[{ name: "Inquiries", data: values }]}
        type="bar"
        height={Math.max(240, labels.length * 40 + 50)}
      />
    </ChartCard>
  );
}

/** Treemap: area = number of inquiries. */
export function CityTreemap({ labels, values, ...card }: CardProps & Series) {
  const { base, palette } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "treemap" },
    colors: [palette[0]],
    plotOptions: {
      treemap: { enableShades: true, shadeIntensity: 0.45, borderRadius: 4 },
    },
    stroke: { width: 2 },
    dataLabels: {
      enabled: true,
      style: { fontSize: "13px", fontWeight: 600 },
      formatter: (text, op) => [String(text), String(op?.value ?? "")],
    },
    legend: { show: false },
    tooltip: { ...base.tooltip, y: { formatter: countFormatter } },
  };
  return (
    <ChartCard {...card} empty={!sum(values)}>
      <ReactApexChart
        options={options}
        series={[
          {
            name: "Inquiries",
            data: labels.map((x, i) => ({ x, y: values[i] })),
          },
        ]}
        type="treemap"
        height={320}
      />
    </ChartCard>
  );
}

/** Heatmap: weekday × month, one hue light→dark (sequential). */
export function WeekdayHeatmap({
  months,
  rows,
  ...card
}: CardProps & {
  months: string[];
  rows: { day: string; values: number[] }[];
}) {
  const { base, palette, mode } = useChartTheme();
  const max = Math.max(0, ...rows.flatMap((r) => r.values));
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "heatmap" },
    colors: [palette[0]],
    plotOptions: {
      heatmap: {
        radius: 4,
        enableShades: true,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: mode === "dark" ? "#1D2939" : "#F2F4F7",
              name: "None",
            },
          ],
        },
      },
    },
    stroke: { width: 2, colors: [mode === "dark" ? "#101828" : "#ffffff"] },
    dataLabels: {
      enabled: true,
      style: { fontSize: "11px" },
      formatter: (v) => (Number(v) ? String(v) : ""),
    },
    xaxis: { ...base.xaxis, categories: months },
    legend: { show: false },
    tooltip: { ...base.tooltip, y: { formatter: countFormatter } },
  };
  return (
    <ChartCard {...card} empty={!max}>
      <ReactApexChart
        options={options}
        // Apex draws the last series on top, so reverse to read Mon → Sun downwards.
        series={[...rows]
          .reverse()
          .map((r) => ({ name: r.day, data: r.values }))}
        type="heatmap"
        height={320}
      />
    </ChartCard>
  );
}
