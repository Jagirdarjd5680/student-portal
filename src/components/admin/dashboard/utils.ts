const pad = (n: number) => String(n).padStart(2, "0");
const sql = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const PERIOD_OPTIONS = [
  { label: "This Month", value: "this-month" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last 12 Months", value: "12m" },
  { label: "This Year", value: "this-year" },
  { label: "Custom Range", value: "custom" },
];

export interface DashboardFilters {
  period: string;
  from: string;
  to: string;
  course_id: string;
}

/** Date range for a preset ("custom" keeps the given from/to). */
export function rangeFor(
  period: string,
  current: { from: string; to: string },
) {
  const today = new Date();
  const to = sql(today);
  const monthsBack = (n: number) =>
    sql(new Date(today.getFullYear(), today.getMonth() - (n - 1), 1));
  switch (period) {
    case "this-month":
      return { from: monthsBack(1), to };
    case "3m":
      return { from: monthsBack(3), to };
    case "12m":
      return { from: monthsBack(12), to };
    case "this-year":
      return { from: `${today.getFullYear()}-01-01`, to };
    case "custom":
      return current;
    default:
      return { from: monthsBack(6), to };
  }
}

export const defaultFilters = (): DashboardFilters => ({
  period: "6m",
  ...rangeFor("6m", { from: "", to: "" }),
  course_id: "",
});

/** "+12%" style change vs the previous period (null when there is nothing to compare). */
export function changeVs(current: number, previous: number) {
  if (!previous)
    return current ? { text: "New", direction: "up" as const } : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    text: `${Math.abs(pct)}%`,
    direction: pct < 0 ? ("down" as const) : ("up" as const),
  };
}

/** Short Indian-style money for axes: ₹1.2L, ₹45K. */
export function shortMoney(v: number) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${Math.round(v)}`;
}
