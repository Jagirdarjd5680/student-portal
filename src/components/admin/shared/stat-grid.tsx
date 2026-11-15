"use client";

import MetricCard from "@/components/main/dashboard/ecommerce/metrics/metric-card";
import { cn } from "@/utils";
import { MetricCardSkeleton } from "./skeletons";

export interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
}

interface StatGridProps {
  items: StatItem[];
  className?: string;
  /** Show skeleton cards instead of values. */
  loading?: boolean;
}

// Row of template MetricCards.
export default function StatGrid({ items, className, loading }: StatGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4",
        className,
      )}
    >
      {loading && items.map((item) => <MetricCardSkeleton key={item.title} />)}
      {!loading &&
        items.map((item) => (
          <MetricCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            value={item.value}
            badge={null}
          >
            {item.hint && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {item.hint}
              </p>
            )}
          </MetricCard>
        ))}
    </div>
  );
}
