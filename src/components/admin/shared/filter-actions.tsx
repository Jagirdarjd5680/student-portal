"use client";

import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/icons";

interface FilterActionsProps {
  onApply: () => void;
  onClear: () => void;
}

export default function FilterActions({
  onApply,
  onClear,
}: FilterActionsProps) {
  return (
    <div className="flex items-end gap-3">
      <Button onClick={onApply}>
        <FilterIcon /> Apply Filters
      </Button>
      <Button variant="outline" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}
