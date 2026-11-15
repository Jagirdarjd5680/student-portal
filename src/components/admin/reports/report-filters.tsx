"use client";

import ComponentCard from "@/components/common/component-card";
import DateInput from "@/components/admin/shared/date-input";
import FilterActions from "@/components/admin/shared/filter-actions";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { useCourses } from "@/components/admin/shared/use-lookups";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHOD_OPTIONS } from "@/data/options";

export interface ReportFilterValues {
  from: string;
  to: string;
  student: string;
  course_id: string;
  method: string;
}

export const EMPTY_FILTERS: ReportFilterValues = {
  from: "",
  to: "",
  student: "",
  course_id: "",
  method: "",
};

interface ReportFiltersProps {
  value: ReportFilterValues;
  onChange: (value: ReportFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function ReportFilters({
  value,
  onChange,
  onApply,
  onClear,
}: ReportFiltersProps) {
  const { courseOptions } = useCourses();
  const set = (key: keyof ReportFilterValues) => (v: string) =>
    onChange({ ...value, [key]: v });

  return (
    <ComponentCard title="Filters">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <FormField label="Date From">
          <DateInput value={value.from} onChange={set("from")} />
        </FormField>
        <FormField label="Date To">
          <DateInput value={value.to} onChange={set("to")} />
        </FormField>
        <FormField label="Student Name/ID">
          <Input
            value={value.student}
            placeholder="Name or Student ID"
            onChange={(e) => set("student")(e.target.value)}
          />
        </FormField>
        <FormField label="Course">
          <SelectBox
            options={courseOptions}
            value={value.course_id}
            onChange={set("course_id")}
            placeholder="All Courses"
          />
        </FormField>
        <FormField label="Payment Method">
          <SelectBox
            options={PAYMENT_METHOD_OPTIONS}
            value={value.method}
            onChange={set("method")}
            placeholder="All Methods"
          />
        </FormField>
      </div>
      <FilterActions onApply={onApply} onClear={onClear} />
    </ComponentCard>
  );
}
