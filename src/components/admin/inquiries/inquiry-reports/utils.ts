import type { Inquiry } from "@/types";
import { isConfirmed } from "../inquiry-list/utils";

export interface Series {
  labels: string[];
  values: number[];
}

export const PERIOD_OPTIONS = [
  { label: "Last 1 month", value: "1" },
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last 12 months", value: "12" },
];

export interface ReportFilters {
  period: string;
  from: string;
  to: string;
  state: string;
  course_id: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const sqlDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "Last N months" = from the 1st of the month N-1 months ago up to today.
export function periodRange(months: number) {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth() - (months - 1),
    1,
  );
  return { from: sqlDate(start), to: sqlDate(today) };
}

export const defaultFilters = (): ReportFilters => ({
  period: "6",
  ...periodRange(6),
  state: "",
  course_id: "",
});

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Calendar months between from..to (falls back to the data's span). */
export function monthBuckets(rows: Inquiry[], from: string, to: string) {
  const dates = rows.map((r) => r.inquiry_date.slice(0, 10)).sort();
  const start = from || dates[0];
  const end = to || dates[dates.length - 1];
  const keys: string[] = [];
  const labels: string[] = [];
  if (!start || !end) return { keys, labels };

  let y = Number(start.slice(0, 4));
  let m = Number(start.slice(5, 7));
  const endKey = end.slice(0, 7);
  for (let i = 0; i < 120; i++) {
    const key = `${y}-${pad(m)}`;
    keys.push(key);
    labels.push(`${MONTHS[m - 1]} ${String(y).slice(2)}`);
    if (key >= endKey) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return { keys, labels };
}

const monthOf = (r: Inquiry) => r.inquiry_date.slice(0, 7);

/** Total, pending and confirmed per month. */
export function monthlyStatus(rows: Inquiry[], keys: string[]) {
  const total = keys.map(() => 0);
  const pending = keys.map(() => 0);
  const confirmed = keys.map(() => 0);
  rows.forEach((r) => {
    const i = keys.indexOf(monthOf(r));
    if (i < 0) return;
    total[i] += 1;
    if (isConfirmed(r)) confirmed[i] += 1;
    else pending[i] += 1;
  });
  return { total, pending, confirmed };
}

/** Weekday (Mon..Sun) × month counts for the heatmap. */
export function weekdayMatrix(rows: Inquiry[], keys: string[]) {
  const grid = WEEKDAYS.map(() => keys.map(() => 0));
  rows.forEach((r) => {
    const i = keys.indexOf(monthOf(r));
    if (i < 0) return;
    const [y, m, d] = r.inquiry_date.slice(0, 10).split("-").map(Number);
    const day = (new Date(y, m - 1, d).getDay() + 6) % 7; // Mon = 0
    grid[day][i] += 1;
  });
  return WEEKDAYS.map((day, i) => ({ day, values: grid[i] }));
}

/** Count rows per label, biggest first; everything past `top` folds into "Other". */
export function countBy(
  rows: Inquiry[],
  pick: (r: Inquiry) => string | null,
  top = 8,
): Series {
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const key = pick(r) || "Not set";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top).reduce((sum, [, n]) => sum + n, 0);
  if (rest) head.push(["Other", rest]);
  return { labels: head.map(([k]) => k), values: head.map(([, n]) => n) };
}

/** Pending / confirmed split per label (e.g. per receptionist), biggest first. */
export function statusBy(
  rows: Inquiry[],
  pick: (r: Inquiry) => string | null,
  top = 8,
) {
  const map = new Map<string, { pending: number; confirmed: number }>();
  rows.forEach((r) => {
    const key = pick(r) || "Not set";
    const entry = map.get(key) || { pending: 0, confirmed: 0 };
    if (isConfirmed(r)) entry.confirmed += 1;
    else entry.pending += 1;
    map.set(key, entry);
  });
  const sorted = [...map.entries()]
    .sort(
      (a, b) => b[1].pending + b[1].confirmed - (a[1].pending + a[1].confirmed),
    )
    .slice(0, top);
  return {
    labels: sorted.map(([k]) => k),
    pending: sorted.map(([, v]) => v.pending),
    confirmed: sorted.map(([, v]) => v.confirmed),
  };
}
