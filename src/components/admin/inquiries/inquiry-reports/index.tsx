"use client";

import {
  ChartCardSkeleton,
  MetricCardSkeleton,
} from "@/components/admin/shared/skeletons";
import StatGrid from "@/components/admin/shared/stat-grid";
import { useCourses } from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import {
  BarChartIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  FilePdfIcon,
  MailIcon,
} from "@/icons";
import { exportExcel } from "@/lib/export";
import { downloadTablePdf } from "@/lib/pdf";
import { formatDate } from "@/lib/format";
import { inquiryService } from "@/services";
import { useState } from "react";
import { INQUIRY_EXPORT_COLUMNS } from "../export-columns";
import { isConfirmed } from "../inquiry-list/utils";
import {
  CityTreemap,
  ConversionRadial,
  RankedBars,
  ShareChart,
  StatusStackedColumns,
  TrendAreaChart,
  WeekdayHeatmap,
} from "./charts";
import ReportFiltersCard from "./report-filters";
import {
  countBy,
  defaultFilters,
  monthBuckets,
  monthlyStatus,
  PERIOD_OPTIONS,
  statusBy,
  weekdayMatrix,
} from "./utils";

// Inquiry analytics: filters → stat tiles → charts → export for the chosen period.
export default function InquiryReports() {
  const { courseOptions } = useCourses();
  const [filters, setFilters] = useState(defaultFilters);
  const [applied, setApplied] = useState(filters);

  const { data, loading } = useApi(
    () =>
      inquiryService.list({
        from: applied.from,
        to: applied.to,
        state: applied.state,
        course_id: applied.course_id,
      }),
    [applied],
  );
  const rows = data || [];
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const runExport = async (key: "excel" | "pdf", fn: () => unknown) => {
    setExporting(key);
    try {
      await fn();
    } finally {
      setExporting(null);
    }
  };
  const { data: institute } = useApi(() => inquiryService.institute(), []);

  const confirmed = rows.filter(isConfirmed).length;
  const rate = rows.length ? Math.round((confirmed / rows.length) * 100) : 0;
  const months = monthBuckets(rows, applied.from, applied.to);
  const monthly = monthlyStatus(rows, months.keys);
  const byCourse = countBy(rows, (r) => r.course_name);
  const bySource = countBy(rows, (r) => r.source, 6);
  const byGender = countBy(rows, (r) => r.gender, 3);
  const byCity = countBy(rows, (r) => r.city, 12);
  const byReceptionist = statusBy(rows, (r) => r.receptionist_name);
  const weekdays = weekdayMatrix(rows, months.keys);

  const periodText =
    PERIOD_OPTIONS.find((p) => p.value === applied.period)?.label ||
    (applied.from || applied.to
      ? `${formatDate(applied.from)} – ${formatDate(applied.to)}`
      : "All time");
  const fileName = `inquiry-report-${applied.from || "all"}-to-${applied.to || "today"}`;

  return (
    <div className="space-y-6">
      <ReportFiltersCard
        value={filters}
        courseOptions={courseOptions}
        onChange={setFilters}
        onApply={() => setApplied(filters)}
        onClear={() => {
          const fresh = {
            period: "",
            from: "",
            to: "",
            state: "",
            course_id: "",
          };
          setFilters(fresh);
          setApplied(fresh);
        }}
      />

      {/* Export bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 dark:bg-white/3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Inquiry Analytics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {periodText} · {rows.length}{" "}
            {rows.length === 1 ? "inquiry" : "inquiries"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Button
            variant="outline"
            disabled={!rows.length}
            loading={exporting === "excel"}
            onClick={() =>
              runExport("excel", () =>
                exportExcel(rows, INQUIRY_EXPORT_COLUMNS, fileName),
              )
            }
          >
            <DownloadIcon /> Export Excel
          </Button>
          <Button
            variant="outline"
            disabled={!rows.length}
            loading={exporting === "pdf"}
            onClick={() =>
              runExport("pdf", () =>
                downloadTablePdf(rows, INQUIRY_EXPORT_COLUMNS, {
                  title: "Inquiry Report",
                  subtitle: [
                    `Period: ${periodText}`,
                    `Total: ${rows.length}  |  Confirmed: ${confirmed}  |  Pending: ${rows.length - confirmed}`,
                  ],
                  fileName,
                  institute: institute?.name,
                }),
              )
            }
          >
            <FilePdfIcon /> Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6" aria-busy aria-label="Loading charts">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCardSkeleton className="xl:col-span-2" />
            <ChartCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCardSkeleton className="xl:col-span-2" />
            <ChartCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          <StatGrid
            items={[
              {
                title: "Total Inquiries",
                value: rows.length,
                icon: <MailIcon />,
              },
              {
                title: "Pending",
                value: rows.length - confirmed,
                icon: <ClockIcon />,
              },
              {
                title: "Confirmed",
                value: confirmed,
                icon: <CheckCircleIcon />,
              },
              {
                title: "Conversion Rate",
                value: `${rate}%`,
                icon: <BarChartIcon />,
              },
            ]}
          />

          {/* Trend over time + conversion meter */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <TrendAreaChart
              className="xl:col-span-2"
              title="Inquiries Trend"
              subtitle={`Inquiries per month · ${periodText}`}
              labels={months.labels}
              values={monthly.total}
            />
            <ConversionRadial
              title="Conversion Rate"
              subtitle="Share of inquiries confirmed"
              rate={rate}
              confirmed={confirmed}
              total={rows.length}
            />
          </div>

          {/* Status by month + source share */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <StatusStackedColumns
              className="xl:col-span-2"
              title="Pending vs Confirmed"
              subtitle="Status of inquiries received each month"
              labels={months.labels}
              pending={monthly.pending}
              confirmed={monthly.confirmed}
            />
            <ShareChart
              title="By Source"
              subtitle="Where inquiries come from"
              {...bySource}
            />
          </div>

          {/* Course ranking + gender split */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RankedBars
              className="xl:col-span-2"
              title="By Course"
              subtitle="Most asked-about courses"
              colorSlot={6}
              {...byCourse}
            />
            <ShareChart title="By Gender" kind="pie" {...byGender} />
          </div>

          {/* Cities + receptionists */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CityTreemap
              title="Top Cities"
              subtitle="Box size = number of inquiries"
              {...byCity}
            />
            <StatusStackedColumns
              title="Receptionist Performance"
              subtitle="Inquiries handled, split by status"
              horizontal
              height={Math.max(240, byReceptionist.labels.length * 44 + 70)}
              {...byReceptionist}
            />
          </div>

          <WeekdayHeatmap
            title="Busiest Days"
            subtitle="Inquiries by weekday and month (darker = more)"
            months={months.labels}
            rows={weekdays}
          />
        </>
      )}
    </div>
  );
}
