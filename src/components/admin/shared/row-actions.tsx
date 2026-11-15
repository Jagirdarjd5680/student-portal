"use client";

import { Button } from "@/components/ui/button";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";

interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// View / Edit / Delete icon buttons for table rows.
export default function RowActions({
  onView,
  onEdit,
  onDelete,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onView}
          aria-label="View"
        >
          <EyeIcon className="size-4 fill-current" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onEdit}
          aria-label="Edit"
        >
          <PencilIcon className="size-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          aria-label="Delete"
          className="text-red-500 hover:text-red-600 dark:text-red-400"
        >
          <TrashBinIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
