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
import { formatCurrency, formatDate } from "@/lib/format";
import type { Admission } from "@/types";
import IdProofCard from "../id-card";
import { isConfirmed } from "./utils";

interface DetailsDialogProps {
  row: Admission | null;
  pdfBusy: boolean;
  onEdit: (row: Admission) => void;
  canEdit?: boolean;
  onPdf: (row: Admission) => void;
  onToggleStatus: (row: Admission) => void;
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
                <th className="w-2/5 bg-gray-50 px-4 py-2 text-start font-medium text-gray-600 dark:bg-white/3 dark:text-gray-400">
                  {label}
                </th>
                <td className="px-4 py-2 break-words whitespace-pre-line text-gray-800 dark:text-white/90">
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

// Wide (landscape) view popup: profile + ID proof card on the left, details on the right.
// The ID card is view-only; the PDF stays the approved admission form.
export default function AdmissionDetailsDialog({
  row,
  pdfBusy,
  onEdit,
  canEdit = true,
  onPdf,
  onToggleStatus,
  onClose,
}: DetailsDialogProps) {
  const photo = fileUrl(row?.photo);
  const address = row
    ? [
        row.address,
        [row.city, row.state].filter(Boolean).join(", "),
        row.zip_code,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <Dialog open={Boolean(row)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Admission Details</DialogTitle>
        </DialogHeader>

        {row && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left: who + ID proof */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
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
                    Admission No:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {row.admission_no}
                    </span>
                  </p>
                  <Badge
                    size="sm"
                    color={isConfirmed(row) ? "success" : "warning"}
                    className="mt-1.5"
                  >
                    {row.status}
                  </Badge>
                </div>
              </div>

              {row.special_offer ? (
                <div className="rounded-xl border-s-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-gray-800 dark:bg-yellow-500/10 dark:text-white/90">
                  <span className="font-semibold">Special Offer:</span>{" "}
                  {row.special_offer_text || "Yes"}
                </div>
              ) : null}

              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Identity Proof
                </h4>
                <IdProofCard key={row.id} admission={row} />
              </div>
            </div>

            {/* Right: details in two columns on wide screens */}
            <div className="grid grid-cols-1 content-start gap-5 lg:col-span-3 xl:grid-cols-2">
              <DetailTable
                title="Admission Details"
                rows={[
                  ["Date of Admission", formatDate(row.admission_date)],
                  ["Course Enrolled", row.course_name],
                  ["Form Fees", formatCurrency(row.form_fees)],
                  ["Receptionist", row.receptionist_name],
                ]}
              />
              <DetailTable
                title="Personal"
                rows={[
                  ["Full Name", row.student_name],
                  ["Father's Name", row.father_name],
                  ["Gender", row.gender],
                  ["Date of Birth", row.dob ? formatDate(row.dob) : null],
                ]}
              />
              <div className="xl:col-span-2">
                <DetailTable
                  title="Contact & Address"
                  rows={[
                    ["Phone Number", row.phone],
                    ["Email Address", row.email],
                    ["Address", address],
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mx-0 mb-0 p-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {row && (
            <>
              {canEdit && (
                <Button variant="outline" onClick={() => onToggleStatus(row)}>
                  {isConfirmed(row) ? "Mark Pending" : "Mark Confirmed"}
                </Button>
              )}
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
