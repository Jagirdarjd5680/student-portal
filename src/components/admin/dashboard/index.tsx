"use client";

import { ChartCardSkeleton } from "@/components/admin/shared/skeletons";
import { useCourses } from "@/components/admin/shared/use-lookups";
import { useApi } from "@/hooks/use-api";
import { dashboardService } from "@/services";
import { useState } from "react";
import {
  AdmissionsByCourseBars,
  ConversionGauge,
  InquiriesAdmissionsLine,
  PaymentMethodsDonut,
  RevenueChart,
} from "./dashboard-charts";
import DashboardFiltersBar from "./dashboard-filters";
import RecentActivity from "./recent-activity";
import StatCards from "./stat-cards";
import { defaultFilters } from "./utils";

// Filters → 4 stat cards → revenue + recent activity → 4 small charts.
export default function Dashboard() {
  const { courseOptions } = useCourses();
  const [filters, setFilters] = useState(defaultFilters);

  const { data, loading, error } = useApi(
    () =>
      dashboardService.overview({
        from: filters.from,
        to: filters.to,
        course_id: filters.course_id,
      }),
    [filters.from, filters.to, filters.course_id],
  );

  // Skeletons only on the very first load; later filter changes keep the old charts visible.
  const firstLoad = loading && !data;
  const v = data?.visible ?? {
    students: true,
    inquiries: true,
    admissions: true,
    revenue: true,
  };
  const nothing =
    Boolean(data) && !v.students && !v.inquiries && !v.admissions && !v.revenue;
  const unit = data?.range.unit === "day" ? "Daily" : "Monthly";
  const empty = { labels: [], revenue: [], inquiries: [], admissions: [] };
  const series = data?.series || empty;

  return (
    <div className="space-y-4 md:space-y-6">
      <DashboardFiltersBar
        value={filters}
        courseOptions={courseOptions}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters())}
      />

      {nothing && (
        <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/3 dark:text-gray-300">
          Welcome! Use the menu on the left to open the sections you have access
          to.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <StatCards
        totals={data?.totals}
        previous={data?.previous}
        visible={data?.visible}
      />

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
        {v.revenue &&
          (firstLoad ? (
            <ChartCardSkeleton className="xl:col-span-2" height={300} />
          ) : (
            <RevenueChart
              className="xl:col-span-2"
              title={`${unit} Revenue`}
              subtitle="Payments received in the selected period"
              labels={series.labels}
              values={series.revenue}
            />
          ))}
        {(v.revenue || v.inquiries || v.admissions) && (
          <RecentActivity
            className={v.revenue ? undefined : "xl:col-span-3"}
            items={data?.recent}
            loading={loading && !data}
          />
        )}
      </div>

      {/* 2 × 2 grid: two charts per row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {firstLoad &&
          Array.from({ length: 4 }, (_, i) => (
            <ChartCardSkeleton key={i} height={200} />
          ))}
        {!firstLoad && (
          <>
            {(v.inquiries || v.admissions) && (
              <InquiriesAdmissionsLine
                title="Inquiries vs Admissions"
                labels={series.labels}
                inquiries={series.inquiries}
                admissions={series.admissions}
              />
            )}
            {v.revenue && (
              <PaymentMethodsDonut
                title="Payment Methods"
                items={data?.paymentMethods || []}
              />
            )}
            {v.admissions && (
              <AdmissionsByCourseBars
                title="Admissions by Course"
                items={data?.admissionsByCourse || []}
              />
            )}
            {v.inquiries && (
              <ConversionGauge
                title="Inquiry Conversion"
                pending={data?.inquiryStatus.pending ?? 0}
                confirmed={data?.inquiryStatus.confirmed ?? 0}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
