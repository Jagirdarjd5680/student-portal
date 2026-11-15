import { formatCurrency } from "@/lib/format";

interface FeeSummaryProps {
  fee: number;
  discount: number;
  total: number;
}

export default function FeeSummary({ fee, discount, total }: FeeSummaryProps) {
  const item = (label: string, value: number, strong = false) => (
    <div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <p
        className={
          strong
            ? "mt-1 text-lg font-semibold text-brand-500 dark:text-brand-400"
            : "mt-1 text-lg font-semibold text-gray-800 dark:text-white/90"
        }
      >
        {formatCurrency(value)}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/3">
      {item("Course Fee", fee)}
      {item("Discount", discount)}
      {item("Total Fee", total, true)}
    </div>
  );
}
