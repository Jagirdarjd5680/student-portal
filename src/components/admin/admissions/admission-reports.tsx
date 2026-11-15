"use client";

import ComponentCard from "@/components/common/component-card";
import DataTable from "@/components/admin/shared/data-table";
import DateInput from "@/components/admin/shared/date-input";
import ExportButtons from "@/components/admin/shared/export-buttons";
import FilterActions from "@/components/admin/shared/filter-actions";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import StatGrid from "@/components/admin/shared/stat-grid";
import TableCard from "@/components/admin/shared/table-card";
import { useCourses } from "@/components/admin/shared/use-lookups";
import { useApi } from "@/hooks/use-api";
import { CheckCircleIcon, ClockIcon, DollarIcon, PageIcon } from "@/icons";
import type { ExportColumn } from "@/lib/export";
import { formatCurrency, formatDate } from "@/lib/format";
import { admissionService } from "@/services";
import type { Admission } from "@/types";
import { useState } from "react";

const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
];

const EMPTY = { from: "", to: "", status: "", course_id: "" };

const columns: ExportColumn<Admission>[] = [
  { header: "Admission No", value: (r) => r.admission_no },
  { header: "Date", value: (r) => formatDate(r.admission_date) },
  { header: "Student Name", value: (r) => r.student_name },
  { header: "Father's Name", value: (r) => r.father_name || "" },
  { header: "Phone", value: (r) => r.phone },
  { header: "Course", value: (r) => r.course_name || "" },
  { header: "City", value: (r) => `${r.city}, ${r.state}` },
  { header: "Form Fees", value: (r) => Number(r.form_fees).toFixed(2) },
  { header: "Special Offer", value: (r) => (r.special_offer ? "Yes" : "No") },
  { header: "Status", value: (r) => r.status },
];

export default function AdmissionReports() {
  const { courseOptions } = useCourses();
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const { data, loading } = useApi(
    () => admissionService.list(applied),
    [applied],
  );
  const rows = data || [];
  const fees = rows.reduce((s, r) => s + Number(r.form_fees), 0);

  const set = (key: keyof typeof EMPTY) => (v: string) =>
    setFilters((f) => ({ ...f, [key]: v }));

  return (
    <div className="space-y-6">
      <ComponentCard title="Filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <FormField label="Date From">
            <DateInput value={filters.from} onChange={set("from")} />
          </FormField>
          <FormField label="Date To">
            <DateInput value={filters.to} onChange={set("to")} />
          </FormField>
          <FormField label="Status">
            <SelectBox
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={set("status")}
              placeholder="All"
            />
          </FormField>
          <FormField label="Course">
            <SelectBox
              options={courseOptions}
              value={filters.course_id}
              onChange={set("course_id")}
              placeholder="All"
            />
          </FormField>
          <FilterActions
            onApply={() => setApplied(filters)}
            onClear={() => {
              setFilters(EMPTY);
              setApplied(EMPTY);
            }}
          />
        </div>
      </ComponentCard>

      <StatGrid
        loading={loading}
        items={[
          { title: "Total", value: rows.length, icon: <PageIcon /> },
          {
            title: "Pending",
            value: rows.filter((r) => r.status === "Pending").length,
            icon: <ClockIcon />,
          },
          {
            title: "Confirmed",
            value: rows.filter((r) => r.status === "Confirmed").length,
            icon: <CheckCircleIcon />,
          },
          {
            title: "Form Fees",
            value: formatCurrency(fees),
            icon: <DollarIcon />,
          },
        ]}
      />

      <TableCard
        title="Admission Report"
        actions={
          <ExportButtons
            rows={rows}
            columns={columns}
            fileName="admission-report"
            title="Admission Report"
            summaryLines={[
              `Total: ${rows.length}`,
              `Form Fees: ${formatCurrency(fees)}`,
            ]}
          />
        }
      >
        <DataTable
          loading={loading}
          rows={rows}
          rowKey={(r) => r.id}
          emptyText="No admissions found"
          columns={columns.map((c) => ({
            header: c.header,
            cell: (r: Admission) => c.value(r) || "-",
          }))}
        />
      </TableCard>
    </div>
  );
}
