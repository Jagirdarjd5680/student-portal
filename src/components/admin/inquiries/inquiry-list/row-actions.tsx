"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  FilePdfIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  TrashBinIcon,
  VerticalDotsIcon,
  WhatsappIcon,
} from "@/icons";
import type { Inquiry } from "@/types";
import ActionButton from "./action-button";
import { isConfirmed, whatsappUrl } from "./utils";

interface RowActionsProps {
  row: Inquiry;
  pdfBusy: boolean;
  onView: (row: Inquiry) => void;
  onPdf: (row: Inquiry) => void;
  onEdit: (row: Inquiry) => void;
  onToggleStatus: (row: Inquiry, confirmed: boolean) => void;
  onDelete: (row: Inquiry) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Direct icon actions (call / view / PDF / edit / delete) + a menu for extras.
export default function InquiryRowActions({
  row,
  pdfBusy,
  onView,
  onPdf,
  onEdit,
  onToggleStatus,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RowActionsProps) {
  const confirmed = isConfirmed(row);

  return (
    <div className="flex items-center gap-1.5">
      <ActionButton label="Call" tone="gray" href={`tel:${row.phone}`}>
        <PhoneIcon />
      </ActionButton>
      <ActionButton label="View" tone="brand" onClick={() => onView(row)}>
        <EyeIcon className="fill-current" />
      </ActionButton>
      <ActionButton
        label="Download PDF"
        tone="orange"
        loading={pdfBusy}
        onClick={() => onPdf(row)}
      >
        <FilePdfIcon />
      </ActionButton>
      {canEdit && (
        <ActionButton label="Edit" tone="sky" onClick={() => onEdit(row)}>
          <PencilIcon />
        </ActionButton>
      )}
      {canDelete && (
        <ActionButton label="Delete" tone="red" onClick={() => onDelete(row)}>
          <TrashBinIcon />
        </ActionButton>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-xs" aria-label="More actions" />
          }
        >
          <VerticalDotsIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {canEdit && (
            <DropdownMenuItem onClick={() => onToggleStatus(row, !confirmed)}>
              {confirmed ? (
                <ClockIcon className="size-4" />
              ) : (
                <CheckCircleIcon className="size-4" />
              )}
              {confirmed ? "Mark as Pending" : "Mark as Confirmed"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            render={
              <a
                href={whatsappUrl(row.phone)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <WhatsappIcon className="size-4" /> WhatsApp
          </DropdownMenuItem>
          {row.email && (
            <DropdownMenuItem render={<a href={`mailto:${row.email}`} />}>
              <MailIcon className="size-4" /> Send Email
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
