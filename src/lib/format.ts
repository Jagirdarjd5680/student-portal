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

export function formatCurrency(value: number | string | null | undefined) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// "2026-11-10" -> "10 Nov 2026"
export function formatDate(value?: string | null) {
  if (!value) return "-";
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return value;
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function todaySql() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

// Mobile numbers are stored without leading zeros ("09876543210" -> "9876543210").
export function stripLeadingZeros<T>(value: T): T {
  return (typeof value === "string" ? value.replace(/^\s*0+/, "") : value) as T;
}
