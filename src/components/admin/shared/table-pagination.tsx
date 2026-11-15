"use client";

import CardFooter from "@/components/main/tables/basic-tables/table-three/card-footer";
import { PAGE_SIZE_OPTIONS } from "@/data/options";
import SelectBox from "./select-field";

interface TablePaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Pagination footer (reuses template card-footer) + page size selector.
export default function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
      <CardFooter
        currentPage={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      <div className="flex items-center gap-3 px-5 pb-4 text-sm text-gray-500 sm:px-6 sm:pb-0 dark:text-gray-400">
        <span className="whitespace-nowrap">
          Showing {from}-{to} of {total}
        </span>
        {onPageSizeChange && (
          <div className="w-24">
            <SelectBox
              size="sm"
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v) || 10)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to slice rows for the current page.
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  return rows.slice((page - 1) * pageSize, page * pageSize);
}
