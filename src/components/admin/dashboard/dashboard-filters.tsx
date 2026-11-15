"use client";

import DateInput from "@/components/admin/shared/date-input";
import SelectBox from "@/components/admin/shared/select-field";
import { Button } from "@/components/ui/button";
import type { Option } from "@/types";
import { PERIOD_OPTIONS, rangeFor, type DashboardFilters } from "./utils";

interface DashboardFiltersProps {
  value: DashboardFilters;
  courseOptions: Option[];
  onChange: (value: DashboardFilters) => void;
  onReset: () => void;
}

// One row of filters; every change applies immediately to cards + charts.
export default function DashboardFiltersBar({
  value,
  courseOptions,
  onChange,
  onReset,
}: DashboardFiltersProps) {
  const custom = value.period === "custom";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center dark:border-gray-800 dark:bg-white/3">
      <div className="me-auto">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of students, inquiries, admissions and revenue
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
        <div className="min-w-0 lg:w-44">
          <SelectBox
            size="sm"
            options={PERIOD_OPTIONS}
            value={value.period}
            onChange={(period) =>
              onChange({
                ...value,
                period: period || "6m",
                ...rangeFor(period || "6m", value),
              })
            }
            placeholder="Period"
          />
        </div>
        {custom && (
          <>
            <div className="min-w-0 lg:w-40">
              <DateInput
                value={value.from}
                placeholder="From"
                onChange={(from) => onChange({ ...value, from })}
              />
            </div>
            <div className="min-w-0 lg:w-40">
              <DateInput
                value={value.to}
                placeholder="To"
                onChange={(to) => onChange({ ...value, to })}
              />
            </div>
          </>
        )}
        <div className="min-w-0 lg:w-52">
          <SelectBox
            size="sm"
            options={courseOptions}
            value={value.course_id}
            onChange={(course_id) => onChange({ ...value, course_id })}
            placeholder="All Courses"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
