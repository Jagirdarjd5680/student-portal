"use client";

import ChartCard from "@/components/admin/shared/charts/chart-card";
import {
  countFormatter,
  useChartTheme,
} from "@/components/admin/shared/charts/chart-theme";
import { formatCurrency } from "@/lib/format";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { shortMoney } from "./utils";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const SMALL = 230;

interface CardProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/** Revenue per day/month — columns, blue (slot 1). */
export function RevenueChart({
  labels,
  values,
  ...card
}: CardProps & { labels: string[]; values: number[] }) {
  const { base, palette, text } = useChartTheme();
  const total = sum(values);
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "bar" },
    colors: [palette[0]],
    plotOptions: {
      bar: {
        columnWidth: labels.length > 20 ? "70%" : "45%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      ...base.xaxis,
      categories: labels,
      tickAmount: Math.min(labels.length, 12),
      labels: {
        style: { colors: text },
        rotate: 0,
        hideOverlappingLabels: true,
      },
    },
    yaxis: { labels: { style: { colors: [text] }, formatter: shortMoney } },
    grid: {
      ...base.grid,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      ...base.tooltip,
      y: { formatter: (v: number) => formatCurrency(v) },
    },
  };
  return (
    <ChartCard
      {...card}
      empty={!total}
      action={
        <div className="text-end">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {formatCurrency(total)}
          </p>
        </div>
      }
    >
      <ReactApexChart
        options={options}
        series={[{ name: "Revenue", data: values }]}
        type="bar"
        height={300}
      />
    </ChartCard>
  );
}

/** Inquiries vs admissions — two lines (violet, orange). */
export function InquiriesAdmissionsLine({
  labels,
  inquiries,
  admissions,
  ...card
}: CardProps & {
  labels: string[];
  inquiries: number[];
  admissions: number[];
}) {
  const { base, palette, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "line" },
    colors: [palette[6], palette[1]],
    stroke: { curve: "smooth", width: 2 },
    markers: { size: 3, strokeWidth: 0, hover: { size: 5 } },
    xaxis: {
      ...base.xaxis,
      categories: labels,
      tickAmount: Math.min(labels.length, 6),
      labels: {
        style: { colors: text },
        rotate: 0,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: [text] },
        formatter: (v) => String(Math.round(v)),
      },
    },
    legend: { ...base.legend, position: "top", horizontalAlign: "left" },
    tooltip: { ...base.tooltip, shared: true, intersect: false },
  };
  return (
    <ChartCard {...card} empty={!sum(inquiries) && !sum(admissions)}>
      <ReactApexChart
        options={options}
        series={[
          { name: "Inquiries", data: inquiries },
          { name: "Admissions", data: admissions },
        ]}
        type="line"
        height={SMALL}
      />
    </ChartCard>
  );
}

/** Revenue share by payment method — donut. */
export function PaymentMethodsDonut({
  items,
  ...card
}: CardProps & { items: { label: string; amount: number; count: number }[] }) {
  const { base, colorsFor, mode } = useChartTheme();
  const labels = items.map((i) => i.label);
  const values = items.map((i) => i.amount);
  const total = sum(values);
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "donut" },
    colors: colorsFor(labels),
    labels,
    stroke: { width: 2, colors: [mode === "dark" ? "#101828" : "#ffffff"] },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            value: {
              fontSize: "16px",
              fontWeight: 600,
              formatter: (v) => shortMoney(Number(v)),
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              formatter: () => shortMoney(total),
            },
          },
        },
      },
    },
    legend: {
      ...base.legend,
      position: "right",
      fontSize: "12px",
      formatter: (name: string, o?: { seriesIndex: number }) =>
        o
          ? `${name} · ${Math.round((values[o.seriesIndex] / (total || 1)) * 100)}%`
          : name,
    },
    responsive: [
      { breakpoint: 640, options: { legend: { position: "bottom" } } },
    ],
    tooltip: {
      ...base.tooltip,
      y: { formatter: (v: number) => formatCurrency(v) },
    },
  };
  return (
    <ChartCard {...card} empty={!total}>
      <ReactApexChart
        options={options}
        series={values}
        type="donut"
        height={SMALL}
      />
    </ChartCard>
  );
}

/** Admissions by course — ranked horizontal bars, green (slot 6). */
export function AdmissionsByCourseBars({
  items,
  ...card
}: CardProps & { items: { label: string; count: number }[] }) {
  const { base, palette, text } = useChartTheme();
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "bar" },
    colors: [palette[5]],
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
      style: { fontSize: "11px", fontWeight: 600, colors: [text] },
    },
    xaxis: {
      ...base.xaxis,
      categories: items.map((i) => i.label),
      labels: {
        style: { colors: text },
        formatter: (v) => String(Math.round(Number(v))),
      },
    },
    yaxis: { labels: { style: { colors: [text] }, maxWidth: 110 } },
    grid: {
      ...base.grid,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      ...base.tooltip,
      y: {
        formatter: (v: number) =>
          `${v} ${v === 1 ? "admission" : "admissions"}`,
      },
    },
  };
  return (
    <ChartCard {...card} empty={!items.length}>
      <ReactApexChart
        options={options}
        series={[{ name: "Admissions", data: items.map((i) => i.count) }]}
        type="bar"
        height={SMALL}
      />
    </ChartCard>
  );
}

/** Share of inquiries confirmed — radial meter, aqua (the "Confirmed" colour). */
export function ConversionGauge({
  pending,
  confirmed,
  ...card
}: CardProps & { pending: number; confirmed: number }) {
  const { base, status, grid, text } = useChartTheme();
  const total = pending + confirmed;
  const rate = total ? Math.round((confirmed / total) * 100) : 0;
  const options: ApexOptions = {
    ...base,
    chart: { ...base.chart, type: "radialBar", sparkline: { enabled: true } },
    colors: [status.confirmed],
    plotOptions: {
      radialBar: {
        startAngle: -110,
        endAngle: 110,
        hollow: { size: "62%" },
        track: { background: grid },
        dataLabels: {
          name: { show: true, offsetY: 24, color: text, fontSize: "12px" },
          value: {
            offsetY: -10,
            fontSize: "26px",
            fontWeight: 600,
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
        height={SMALL - 30}
      />
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {countFormatter(confirmed)} confirmed · {pending} pending
      </p>
    </ChartCard>
  );
}
