"use client";

import { Button } from "@/components/ui/button";
import { UsersIcon, XIcon } from "@/icons";

interface SourceBannerProps {
  /** e.g. "Inquiry" */
  sourceLabel: string;
  /** Shown once a record was picked, e.g. "81785 · Vinay Shankhla". */
  picked?: string | null;
  hint: string;
  onPick: () => void;
  onClear: () => void;
}

// "Select from …" bar at the top of a form; shows what was picked.
export default function SourceBanner({
  sourceLabel,
  picked,
  hint,
  onPick,
  onClear,
}: SourceBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-4 py-3 sm:flex-row sm:items-center dark:border-brand-500/30 dark:bg-brand-500/5">
      <div className="min-w-0 flex-1 text-sm">
        {picked ? (
          <>
            <span className="text-gray-500 dark:text-gray-400">
              Filled from {sourceLabel}:{" "}
            </span>
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {picked}
            </span>
          </>
        ) : (
          <span className="text-gray-600 dark:text-gray-300">{hint}</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={picked ? "outline" : "default"}
          onClick={onPick}
        >
          <UsersIcon /> {picked ? "Change" : `Select from ${sourceLabel}`}
        </Button>
        {picked && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClear}
            aria-label="Clear selection"
          >
            <XIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
