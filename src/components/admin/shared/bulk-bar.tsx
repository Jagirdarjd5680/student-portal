"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, FilePdfIcon } from "@/icons";
import { useState } from "react";

type Action = () => void | Promise<unknown>;

interface BulkBarProps {
  count: number;
  /** True while a status change for the ticked rows is running. */
  busy: boolean;
  onExcel: Action;
  onPdf: Action;
  /** Status buttons are shown only when given. */
  onConfirm?: Action;
  onPending?: Action;
  onDelete: Action;
  onClear: () => void;
  /** Hide the status / delete buttons when the user may not do them. */
  canEdit?: boolean;
  canDelete?: boolean;
}

// Shown when rows are ticked: every action applies to all ticked rows.
// The clicked button shows a spinner while its work is running.
export default function BulkBar({
  count,
  busy,
  onExcel,
  onPdf,
  onConfirm,
  onPending,
  onDelete,
  onClear,
  canEdit = true,
  canDelete = true,
}: BulkBarProps) {
  const [running, setRunning] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<"confirm" | "pending" | null>(
    null,
  );

  if (count === 0) return null;

  const run = (key: string, fn: Action) => async () => {
    setRunning(key);
    try {
      await fn();
    } finally {
      setRunning(null);
    }
  };
  const status = (key: "confirm" | "pending", fn: Action) => () => {
    setLastStatus(key);
    fn();
  };

  return (
    <div className="mx-5 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 sm:mx-6 dark:border-brand-500/20 dark:bg-brand-500/10">
      <span className="me-auto text-sm font-medium text-gray-800 dark:text-white/90">
        {count} selected
      </span>
      <Button
        size="xs"
        variant="outline"
        loading={running === "excel"}
        onClick={run("excel", onExcel)}
      >
        <DownloadIcon /> Export Excel
      </Button>
      <Button
        size="xs"
        variant="outline"
        loading={running === "pdf"}
        onClick={run("pdf", onPdf)}
      >
        <FilePdfIcon /> {running === "pdf" ? "Exporting..." : "Export PDF"}
      </Button>
      {onConfirm && canEdit && (
        <Button
          size="xs"
          variant="outline"
          disabled={busy}
          loading={busy && lastStatus === "confirm"}
          onClick={status("confirm", onConfirm)}
        >
          Mark Confirmed
        </Button>
      )}
      {onPending && canEdit && (
        <Button
          size="xs"
          variant="outline"
          disabled={busy}
          loading={busy && lastStatus === "pending"}
          onClick={status("pending", onPending)}
        >
          Mark Pending
        </Button>
      )}
      {canDelete && (
        <Button
          size="xs"
          variant="destructive"
          disabled={busy}
          onClick={() => onDelete()}
        >
          Delete
        </Button>
      )}
      <Button size="xs" variant="ghost" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
