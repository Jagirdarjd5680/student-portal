import { cn } from "@/utils";

// Label on the left, value on the right, thin divider: used by the portal cards.
export default function InfoRow({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 text-sm last:border-0 dark:border-gray-800">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={cn(
          "text-end",
          strong ? "font-bold" : "font-semibold",
          tone || "text-gray-800 dark:text-white/90",
        )}
      >
        {value ?? "-"}
      </span>
    </div>
  );
}
