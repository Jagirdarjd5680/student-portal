"use client";

import type { Column } from "@/components/admin/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationPinIcon, MailIcon, PhoneIcon, UserIcon } from "@/icons";
import { formatDate } from "@/lib/format";
import type { Inquiry } from "@/types";
import InquiryRowActions from "./row-actions";
import StatusToggle from "./status-toggle";

interface ColumnArgs {
  rows: Inquiry[];
  selected: Set<number>;
  busyIds: Set<number>;
  pdfId: number | null;
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleStatus: (row: Inquiry, confirmed: boolean) => void;
  onView: (row: Inquiry) => void;
  onPdf: (row: Inquiry) => void;
  onEdit: (row: Inquiry) => void;
  onDelete: (row: Inquiry) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const primary =
  "font-semibold whitespace-nowrap text-gray-800 dark:text-white/90";
const secondary =
  "mt-1 flex items-center gap-1.5 text-xs whitespace-nowrap text-gray-500 dark:text-gray-400";

export function inquiryColumns({
  rows,
  selected,
  busyIds,
  pdfId,
  onSelect,
  onSelectAll,
  onToggleStatus,
  onView,
  onPdf,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ColumnArgs): Column<Inquiry>[] {
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = !allChecked && rows.some((r) => selected.has(r.id));

  return [
    {
      id: "select",
      header: (
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(v) => onSelectAll(Boolean(v))}
          aria-label="Select all"
        />
      ),
      className: "w-10",
      cell: (r) => (
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={(v) => onSelect(r.id, Boolean(v))}
          aria-label={`Select ${r.inquiry_no}`}
        />
      ),
    },
    {
      header: "Form No",
      cell: (r) => (
        <button
          type="button"
          onClick={() => onView(r)}
          className="text-base font-semibold text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400"
        >
          {r.inquiry_no}
        </button>
      ),
    },
    {
      header: "Status",
      cell: (r) => (
        <StatusToggle
          row={r}
          busy={busyIds.has(r.id)}
          readOnly={!canEdit}
          onToggle={onToggleStatus}
        />
      ),
    },
    {
      header: "Date",
      cell: (r) => (
        <>
          <p className={primary}>{formatDate(r.inquiry_date)}</p>
          <p className={secondary}>{r.source || "-"}</p>
        </>
      ),
    },
    {
      header: "Name",
      cell: (r) => (
        <>
          <p className={primary}>{r.student_name}</p>
          <p className={secondary}>
            <UserIcon className="size-3.5 shrink-0 text-gray-400" />
            {r.gender || "-"}
          </p>
        </>
      ),
    },
    {
      header: "Contact",
      cell: (r) => (
        <>
          <a
            href={`tel:${r.phone}`}
            className={`${primary} flex items-center gap-1.5 hover:text-brand-500`}
          >
            <PhoneIcon className="size-3.5 shrink-0 text-gray-400" /> {r.phone}
          </a>
          {r.email ? (
            <a
              href={`mailto:${r.email}`}
              className={`${secondary} hover:text-brand-500`}
            >
              <MailIcon className="size-3.5 shrink-0 text-gray-400" /> {r.email}
            </a>
          ) : (
            <p className={secondary}>
              <MailIcon className="size-3.5 shrink-0 text-gray-400" /> -
            </p>
          )}
        </>
      ),
    },
    {
      header: "Details",
      cell: (r) => (
        <>
          <Badge size="sm" color="info" className="max-w-56 truncate">
            {r.course_name || "No course"}
          </Badge>
          <p className={secondary}>
            <LocationPinIcon className="size-3.5 shrink-0 text-gray-400" />
            {r.city || "-"}
          </p>
        </>
      ),
    },
    {
      header: "Actions",
      cell: (r) => (
        <InquiryRowActions
          row={r}
          pdfBusy={pdfId === r.id}
          onView={onView}
          onPdf={onPdf}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ),
    },
  ];
}
