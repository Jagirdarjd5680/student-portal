"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { TableRowsSkeleton } from "./skeletons";

export interface Column<T> {
  header: React.ReactNode;
  /** Stable key; required when `header` is not a string. */
  id?: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey: (row: T) => string | number;
  /** Extra classes per body row (e.g. tint by status). */
  rowClassName?: (row: T) => string | undefined;
  /** Light background on row hover. */
  hoverable?: boolean;
}

// Simple table using the template's Table primitives and styling.
export default function DataTable<T>({
  columns,
  rows,
  loading,
  emptyText = "No records found",
  rowKey,
  rowClassName,
  hoverable,
}: DataTableProps<T>) {
  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id ?? String(col.header)}
                isHeader
                className="px-4 py-3 text-start text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <TableRowsSkeleton columns={columns.length} />
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow
                key={rowKey(row)}
                className={cn(
                  "transition-colors",
                  hoverable && "hover:bg-gray-50 dark:hover:bg-white/3",
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id ?? String(col.header)}
                    className={cn(
                      "px-4 py-3 text-sm text-gray-500 dark:text-gray-400",
                      col.className,
                    )}
                  >
                    {col.cell(row, i)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
