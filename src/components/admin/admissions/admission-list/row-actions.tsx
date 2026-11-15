"use client";

import { Button } from "@/components/ui/button";
import { EyeIcon, FilePdfIcon, PencilIcon, TrashBinIcon } from "@/icons";
import type { Admission } from "@/types";
import { cn } from "@/utils";

interface RowActionsProps {
  row: Admission;
  pdfBusy: boolean;
  onView: (row: Admission) => void;
  onEdit: (row: Admission) => void;
  onPdf: (row: Admission) => void;
  onDelete: (row: Admission) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const base =
  "size-9 rounded-none border-0 [&_svg]:size-4 first:rounded-s-lg last:rounded-e-lg";

// Joined solid button group: View · Edit · PDF · Delete (navy / sky / yellow / red).
export default function AdmissionRowActions({
  row,
  pdfBusy,
  onView,
  onEdit,
  onPdf,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RowActionsProps) {
  const items = [
    {
      label: "View",
      onClick: () => onView(row),
      icon: <EyeIcon className="fill-current" />,
      tone: "bg-blue-950 text-yellow-400 hover:bg-blue-900 hover:text-yellow-300 dark:bg-blue-900 dark:hover:bg-blue-800",
    },
    {
      label: "Edit",
      onClick: () => onEdit(row),
      icon: <PencilIcon />,
      tone: "bg-sky-400 text-blue-950 hover:bg-sky-500 hover:text-blue-950",
    },
    {
      label: "Download PDF",
      onClick: () => onPdf(row),
      icon: <FilePdfIcon />,
      tone: "bg-yellow-400 text-blue-950 hover:bg-yellow-500 hover:text-blue-950",
      loading: pdfBusy,
    },
    {
      label: "Delete",
      onClick: () => onDelete(row),
      icon: <TrashBinIcon />,
      tone: "bg-red-500 text-white hover:bg-red-600 hover:text-white",
    },
  ];

  return (
    <div className="inline-flex shadow-theme-xs">
      {items
        .filter(
          (a) =>
            (a.label !== "Edit" || canEdit) &&
            (a.label !== "Delete" || canDelete),
        )
        .map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            size="icon-xs"
            title={a.label}
            aria-label={a.label}
            loading={a.loading}
            onClick={a.onClick}
            className={cn(base, a.tone)}
          >
            {a.icon}
          </Button>
        ))}
    </div>
  );
}
