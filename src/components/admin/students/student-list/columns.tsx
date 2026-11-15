"use client";

import type { Column } from "@/components/admin/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";
import { UserIcon } from "@/icons";
import { fileUrl } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Student } from "@/types";
import { cn } from "@/utils";
import StudentRowActions from "./row-actions";
import { discountText, feeStatus } from "./utils";

interface ColumnArgs {
  rows: Student[];
  selected: Set<number>;
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (row: Student) => void;
  canEdit: boolean;
  canPay: boolean;
  canDelete: boolean;
}

const STATUS_TONE = {
  Paid: "bg-green-500 text-white",
  Partial: "bg-yellow-400 text-blue-950",
  Unpaid: "bg-red-500 text-white",
} as const;

const strong =
  "font-semibold whitespace-nowrap text-gray-800 dark:text-white/90";
const sub =
  "mt-0.5 block text-xs whitespace-nowrap text-gray-500 dark:text-gray-400";

export function studentColumns(a: ColumnArgs): Column<Student>[] {
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
          aria-label={`Select ${r.student_code}`}
        />
      ),
    },
    {
      header: "Student",
      cell: (r) => (
        <Link
          href={`/students/${r.id}`}
          className="group flex items-center gap-3"
        >
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
            {r.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl(r.photo)}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <UserIcon className="size-5 text-gray-400" />
            )}
          </span>
          <span className="min-w-0">
            <span className={cn(strong, "block group-hover:text-brand-500")}>
              {r.full_name}
            </span>
            <span className="mt-0.5 block text-xs font-semibold whitespace-nowrap text-blue-950 dark:text-blue-300">
              {r.student_code}
            </span>
          </span>
        </Link>
      ),
    },
    {
      header: "Contact",
      cell: (r) => (
        <>
          {r.phone ? (
            <a
              href={`tel:${r.phone}`}
              className="block whitespace-nowrap text-gray-800 hover:text-brand-500 dark:text-white/90"
            >
              {r.phone}
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {r.email && (
            <a
              href={`mailto:${r.email}`}
              className={cn(sub, "hover:text-brand-500")}
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
        <>
          <span className="inline-block max-w-48 truncate rounded-md bg-blue-950 px-2.5 py-1 text-xs font-semibold text-yellow-400 dark:bg-blue-900">
            {r.course_name || "No course"}
          </span>
          <span className={sub}>
            {[
              r.duration_name,
              r.admission_date && `Joined ${formatDate(r.admission_date)}`,
            ]
              .filter(Boolean)
              .join(" · ") || "-"}
          </span>
        </>
      ),
    },
    {
      header: "Total Fee",
      cell: (r) => (
        <>
          <span className={strong}>{formatCurrency(r.total_fee)}</span>
          {discountText(r) && (
            <span className={sub}>
              <span className="line-through">
                {formatCurrency(r.course_fee)}
              </span>{" "}
              · {discountText(r)}
            </span>
          )}
        </>
      ),
    },
    {
      header: "Paid / Balance",
      cell: (r) => {
        const total = Number(r.total_fee) || 0;
        const pct = total
          ? Math.min(100, Math.round((Number(r.total_paid) / total) * 100))
          : 100;
        return (
          <div className="w-36">
            <div className="flex justify-between gap-2 text-xs whitespace-nowrap">
              <span className="font-semibold text-green-600 dark:text-green-500">
                {formatCurrency(r.total_paid)}
              </span>
              <span
                className={cn(
                  "font-semibold",
                  Number(r.balance) > 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-400",
                )}
              >
                {formatCurrency(Math.max(0, Number(r.balance)))}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% paid`}
            >
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Fee Status",
      cell: (r) => {
        const s = feeStatus(r);
        return (
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
              STATUS_TONE[s],
            )}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (r) => (
        <StudentRowActions
          row={r}
          onDelete={a.onDelete}
          canEdit={a.canEdit}
          canPay={a.canPay}
          canDelete={a.canDelete}
        />
      ),
    },
  ];
}
