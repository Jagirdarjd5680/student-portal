"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Link } from "@/i18n/navigation";
import {
  DollarIcon,
  EyeIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  TrashBinIcon,
  VerticalDotsIcon,
  WhatsappIcon,
} from "@/icons";
import { whatsappUrl } from "@/components/admin/inquiries/inquiry-list/utils";
import type { Student } from "@/types";
import { cn } from "@/utils";

interface RowActionsProps {
  row: Student;
  onDelete: (row: Student) => void;
  canEdit?: boolean;
  canPay?: boolean;
  canDelete?: boolean;
}

const base =
  "size-9 rounded-none border-0 [&_svg]:size-4 first:rounded-s-lg last:rounded-e-lg";

// Two direct actions (Edit · Add Payment) + a three-dot menu for the rest.
// The student's name already opens the profile, so View lives in the menu.
export default function StudentRowActions({
  row,
  onDelete,
  canEdit = true,
  canPay = true,
  canDelete = true,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="inline-flex shadow-theme-xs">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon-xs"
            title="Edit"
            aria-label="Edit"
            nativeButton={false}
            render={<Link href={`/students/${row.id}/edit`} />}
            className={cn(
              base,
              "bg-sky-400 text-blue-950 hover:bg-sky-500 hover:text-blue-950",
            )}
          >
            <PencilIcon />
          </Button>
        )}
        {canPay && (
          <Button
            variant="ghost"
            size="icon-xs"
            title="Add Payment"
            aria-label="Add Payment"
            nativeButton={false}
            render={<Link href={`/payments/add?student=${row.id}`} />}
            className={cn(
              base,
              "bg-green-500 text-white hover:bg-green-600 hover:text-white",
            )}
          >
            <DollarIcon />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-xs" aria-label="More actions" />
          }
        >
          <VerticalDotsIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem render={<Link href={`/students/${row.id}`} />}>
            <EyeIcon className="size-4 fill-current" /> View Details
          </DropdownMenuItem>
          {row.phone && (
            <>
              <DropdownMenuItem render={<a href={`tel:${row.phone}`} />}>
                <PhoneIcon className="size-4" /> Call
              </DropdownMenuItem>
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
            </>
          )}
          {row.email && (
            <DropdownMenuItem render={<a href={`mailto:${row.email}`} />}>
              <MailIcon className="size-4" /> Send Email
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row)}
              >
                <TrashBinIcon className="size-4" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
