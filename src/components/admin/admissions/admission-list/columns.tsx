"use client";

import type { Column } from "@/components/admin/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Admission } from "@/types";
import { cn } from "@/utils";
import AdmissionRowActions from "./row-actions";
import { isConfirmed } from "./utils";

interface ColumnArgs {
  rows: Admission[];
  selected: Set<number>;
  busyIds: Set<number>;
  pdfId: number | null;
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleStatus: (row: Admission) => void;
  onView: (row: Admission) => void;
  onEdit: (row: Admission) => void;
  onPdf: (row: Admission) => void;
  onDelete: (row: Admission) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const strong = "font-semibold text-gray-800 dark:text-white/90";

export function admissionColumns(a: ColumnArgs): Column<Admission>[] {
  const allChecked =
    a.rows.length > 0 && a.rows.every((r) => a.selected.has(r.id));
  const someChecked = !allChecked && a.rows.some((r) => a.selected.has(r.id));

  return [
    {
      id: "select",
      header: (
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(v) => a.onSelectAll(Boolean(v))}
          aria-label="Select all"
        />
      ),
      className: "w-10",
      cell: (r) => (
        <Checkbox
          checked={a.selected.has(r.id)}
          onCheckedChange={(v) => a.onSelect(r.id, Boolean(v))}
          aria-label={`Select ${r.admission_no}`}
        />
      ),
    },
    {
      header: "Admission No",
      cell: (r) => (
        <button
          type="button"
          onClick={() => a.onView(r)}
          className="text-sm font-semibold text-blue-950 hover:underline dark:text-blue-300"
        >
          {r.admission_no}
        </button>
      ),
    },
    {
      header: "Status",
      cell: (r) => {
        const done = isConfirmed(r);
        if (!a.canEdit) {
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                done
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-blue-950",
              )}
            >
              {r.status}
            </span>
          );
        }
        return (
          <button
            type="button"
            disabled={a.busyIds.has(r.id)}
            onClick={() => a.onToggleStatus(r)}
            title={done ? "Click to mark Pending" : "Click to mark Confirmed"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-70",
              done ? "bg-green-500 text-white" : "bg-yellow-400 text-blue-950",
            )}
          >
            {a.busyIds.has(r.id) && <Spinner className="size-3" />}
            {r.status}
          </button>
        );
      },
    },
    {
      header: "Date",
      className: "whitespace-nowrap",
      cell: (r) => formatDate(r.admission_date),
    },
    {
      header: "Name",
      cell: (r) => <span className={strong}>{r.student_name}</span>,
    },
    { header: "Father Name", cell: (r) => r.father_name || "-" },
    {
      header: "Contact",
      cell: (r) => (
        <>
          <a
            href={`tel:${r.phone}`}
            className="block text-gray-800 hover:text-brand-500 dark:text-white/90"
          >
            {r.phone}
          </a>
          {r.email && (
            <a
              href={`mailto:${r.email}`}
              className="mt-0.5 block text-xs hover:text-brand-500"
            >
              {r.email}
            </a>
          )}
        </>
      ),
    },
    {
      header: "Course",
      cell: (r) => (
        <span className="inline-block max-w-48 truncate rounded-md bg-blue-950 px-2.5 py-1 text-xs font-semibold text-yellow-400 dark:bg-blue-900">
          {r.course_name || "No course"}
        </span>
      ),
    },
    {
      header: "Form Fees",
      className: "whitespace-nowrap",
      cell: (r) => (
        <span className={strong}>{formatCurrency(r.form_fees)}</span>
      ),
    },
    {
      header: "Actions",
      cell: (r) => (
        <AdmissionRowActions
          row={r}
          pdfBusy={a.pdfId === r.id}
          onView={a.onView}
          onEdit={a.onEdit}
          onPdf={a.onPdf}
          onDelete={a.onDelete}
          canEdit={a.canEdit}
          canDelete={a.canDelete}
        />
      ),
    },
  ];
}
