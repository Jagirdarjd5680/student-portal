"use client";

import { cn } from "@/utils";
import { ChartBodySkeleton } from "../skeletons";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  empty?: boolean;
  /** Show a skeleton body instead of the chart. */
  loading?: boolean;
  /** Right side of the header (e.g. a total). */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// Card frame shared by every report chart.
export default function ChartCard({
  title,
  subtitle,
  empty,
  loading,
  action,
  className,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {loading ? (
        <div className="mt-6">
          <ChartBodySkeleton height={220} />
        </div>
      ) : empty ? (
        <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          No data for this period
        </p>
      ) : (
        <div className="-ms-2 mt-4">{children}</div>
      )}
    </div>
  );
}
