"use client";

import { MetricCardSkeleton } from "@/components/admin/shared/skeletons";
import MetricCard from "@/components/main/dashboard/ecommerce/metrics/metric-card";
import { DollarIcon, MailIcon, PageIcon, UsersIcon } from "@/icons";
import { formatCurrency } from "@/lib/format";
import type { DashboardTotals } from "@/types";
import { changeVs } from "./utils";

interface StatCardsProps {
  totals?: DashboardTotals;
  previous?: DashboardTotals;
  /** Hide cards for modules the user may not view. */
  visible?: Record<string, boolean>;
}

const CARDS: {
  key: keyof DashboardTotals;
  title: string;
  icon: React.ReactNode;
  money?: boolean;
}[] = [
  { key: "students", title: "Total Students", icon: <UsersIcon /> },
  { key: "inquiries", title: "Total Inquiries", icon: <MailIcon /> },
  { key: "admissions", title: "Total Admissions", icon: <PageIcon /> },
  { key: "revenue", title: "Revenue", icon: <DollarIcon />, money: true },
];

// Four headline numbers for the selected period, each vs the previous period.
export default function StatCards({
  totals,
  previous,
  visible,
}: StatCardsProps) {
  const cards = CARDS.filter((c) => visible?.[c.key] !== false);
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {!totals && cards.map((c) => <MetricCardSkeleton key={c.key} />)}
      {totals &&
        cards.map((c) => {
          const value = totals?.[c.key];
          const change =
            totals && previous
              ? changeVs(totals[c.key], previous[c.key])
              : null;
          return (
            <MetricCard
              key={c.key}
              icon={c.icon}
              title={c.title}
              value={
                value === undefined
                  ? "-"
                  : c.money
                    ? formatCurrency(value)
                    : value
              }
              change={change?.text}
              direction={change?.direction}
            >
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                vs previous period
              </p>
            </MetricCard>
          );
        })}
    </div>
  );
}
