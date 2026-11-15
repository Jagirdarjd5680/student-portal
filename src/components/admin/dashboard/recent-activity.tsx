"use client";

import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/admin/shared/skeletons";
import { Link } from "@/i18n/navigation";
import { DollarIcon, MailIcon, PageIcon } from "@/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DashboardActivity } from "@/types";
import { cn } from "@/utils";

const TYPES = {
  inquiry: {
    label: "New inquiry",
    href: "/inquiries",
    icon: <MailIcon />,
    tone: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  },
  admission: {
    label: "New admission",
    href: "/admissions",
    icon: <PageIcon />,
    tone: "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
  },
  payment: {
    label: "Payment received",
    href: "/payments",
    icon: <DollarIcon />,
    tone: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  },
} as const;

interface RecentActivityProps {
  items?: DashboardActivity[];
  loading: boolean;
  className?: string;
}

// Latest inquiries, admissions and payments in one timeline.
export default function RecentActivity({
  items = [],
  loading,
  className,
}: RecentActivityProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Activity
        </h3>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/payments" />}
        >
          See all
        </Button>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No activity yet
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((a) => {
            const t = TYPES[a.type];
            return (
              <li key={`${a.type}-${a.id}`}>
                <Link
                  href={t.href}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full [&>svg]:size-4.5",
                      t.tone,
                    )}
                  >
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {a.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                      {t.label}
                      {a.detail ? ` · ${a.detail}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-end">
                    {a.type === "payment" && a.amount !== null && (
                      <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
                        {formatCurrency(a.amount)}
                      </span>
                    )}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(a.date)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
