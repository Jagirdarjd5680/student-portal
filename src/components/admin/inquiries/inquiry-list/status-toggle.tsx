"use client";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { Inquiry } from "@/types";
import { isConfirmed, statusLabel } from "./utils";

interface StatusToggleProps {
  row: Inquiry;
  busy: boolean;
  /** No edit permission: show the status only. */
  readOnly?: boolean;
  onToggle: (row: Inquiry, confirmed: boolean) => void;
}

// Pending ⇄ Confirmed switch with the status badge underneath.
export default function StatusToggle({
  row,
  busy,
  readOnly,
  onToggle,
}: StatusToggleProps) {
  const confirmed = isConfirmed(row);
  if (readOnly) {
    return (
      <Badge size="sm" color={confirmed ? "success" : "warning"}>
        {statusLabel(row)}
      </Badge>
    );
  }
  return (
    <div className="flex w-max flex-col items-center gap-1.5">
      <Switch
        size="sm"
        checked={confirmed}
        disabled={busy}
        onCheckedChange={(v) => onToggle(row, v)}
        aria-label={`Status: ${statusLabel(row)}`}
      />
      <Badge size="sm" color={confirmed ? "success" : "warning"}>
        {busy && <Spinner className="size-3" />}
        {busy ? "Saving" : statusLabel(row)}
      </Badge>
    </div>
  );
}
