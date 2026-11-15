"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilePdfIcon, PencilIcon, UserIcon } from "@/icons";
import { fileUrl } from "@/lib/config";
import { formatDate } from "@/lib/format";
import type { Inquiry } from "@/types";
import { isConfirmed, statusLabel } from "./utils";

interface DetailsDialogProps {
  row: Inquiry | null;
  pdfBusy: boolean;
  onEdit: (row: Inquiry) => void;
  canEdit?: boolean;
  onPdf: (row: Inquiry) => void;
  onClose: () => void;
}

function DetailTable({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | null | undefined][];
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {title}
      </h4>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th className="w-2/5 bg-gray-50 px-4 py-2.5 text-start font-medium text-gray-600 dark:bg-white/3 dark:text-gray-400">
                  {label}
                </th>
                <td className="px-4 py-2.5 break-words whitespace-pre-line text-gray-800 dark:text-white/90">
                  {value || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// View popup: plain details in the app's own UI (the PDF is a separate download).
export default function InquiryDetailsDialog({
  row,
  pdfBusy,
  onEdit,
  canEdit = true,
  onPdf,
  onClose,
}: DetailsDialogProps) {
  const photo = fileUrl(row?.photo);
  const place = [row?.city, row?.state].filter(Boolean).join(", ");

  return (
    <Dialog open={Boolean(row)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
        </DialogHeader>

        {row && (
          <div className="space-y-5">
            {/* Summary: photo + name + form no + status */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={row.student_name}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon className="size-8 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">
                  {row.student_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Form No:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {row.inquiry_no}
                  </span>
                </p>
              </div>
              <Badge size="sm" color={isConfirmed(row) ? "success" : "warning"}>
                {statusLabel(row)}
              </Badge>
            </div>

            <DetailTable
              title="Inquiry Details"
              rows={[
                ["Date of Inquiry", formatDate(row.inquiry_date)],
                ["Course Interested", row.course_name],
                ["Source of Inquiry", row.source],
                ["Receptionist", row.receptionist_name],
              ]}
            />
            <DetailTable
              title="Student Information"
              rows={[
                ["Full Name", row.student_name],
                ["Gender", row.gender],
                ["Phone Number", row.phone],
                ["Email", row.email],
                ["Address", [row.address, place].filter(Boolean).join("\n")],
                ["Zip Code", row.zip_code],
              ]}
            />
          </div>
        )}

        <DialogFooter className="mx-0 mb-0 p-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {row && (
            <>
              {canEdit && (
                <Button variant="outline" onClick={() => onEdit(row)}>
                  <PencilIcon /> Edit
                </Button>
              )}
              <Button loading={pdfBusy} onClick={() => onPdf(row)}>
                {!pdfBusy && <FilePdfIcon />}
                {pdfBusy ? "Preparing..." : "Download PDF"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
