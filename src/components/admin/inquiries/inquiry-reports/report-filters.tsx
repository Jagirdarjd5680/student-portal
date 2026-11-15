"use client";

import ComponentCard from "@/components/common/component-card";
import DateInput from "@/components/admin/shared/date-input";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { Button } from "@/components/ui/button";
import { STATE_OPTIONS } from "@/data/india";
import { FilterIcon } from "@/icons";
import type { Option } from "@/types";
import { PERIOD_OPTIONS, periodRange, type ReportFilters } from "./utils";

interface ReportFiltersProps {
  value: ReportFilters;
  courseOptions: Option[];
  onChange: (value: ReportFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

// Period (last N months) + custom date range + state + course.
export default function ReportFiltersCard({
  value,
  courseOptions,
  onChange,
  onApply,
  onClear,
}: ReportFiltersProps) {
  const set = (key: keyof ReportFilters) => (v: string) => {
    // Editing a date by hand switches the period to "custom".
    const period = key === "from" || key === "to" ? "" : value.period;
    onChange({ ...value, period, [key]: v });
  };

  return (
    <ComponentCard title="Filters">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormField label="Period" className="min-w-0">
          <SelectBox
            options={PERIOD_OPTIONS}
            value={value.period}
            placeholder="Custom range"
            onChange={(p) =>
              onChange(
                p
                  ? { ...value, period: p, ...periodRange(Number(p)) }
                  : { ...value, period: "" },
              )
            }
          />
        </FormField>
        <FormField label="Date From" className="min-w-0">
          <DateInput value={value.from} onChange={set("from")} />
        </FormField>
        <FormField label="Date To" className="min-w-0">
          <DateInput value={value.to} onChange={set("to")} />
        </FormField>
        <FormField label="State" className="min-w-0">
          <SelectBox
            options={STATE_OPTIONS}
            value={value.state}
            onChange={set("state")}
            placeholder="All States"
          />
        </FormField>
        <FormField label="Course" className="min-w-0">
          <SelectBox
            options={courseOptions}
            value={value.course_id}
            onChange={set("course_id")}
            placeholder="All Courses"
          />
        </FormField>
        <div className="grid min-w-0 grid-cols-2 items-end gap-3">
          <Button className="h-11 w-full" onClick={onApply}>
            <FilterIcon /> Apply Filters
          </Button>
          <Button className="h-11 w-full" variant="outline" onClick={onClear}>
            Clear All
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}
