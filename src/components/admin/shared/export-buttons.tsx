"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/icons";
import {
  exportCsv,
  exportExcel,
  exportPdf,
  type ExportColumn,
} from "@/lib/export";

interface ExportButtonsProps<T> {
  rows: T[];
  columns: ExportColumn<T>[];
  fileName: string;
  title: string;
  summaryLines?: string[];
}

export default function ExportButtons<T>({
  rows,
  columns,
  fileName,
  title,
  summaryLines,
}: ExportButtonsProps<T>) {
  const disabled = rows.length === 0;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => exportCsv(rows, columns, fileName)}
      >
        <DownloadIcon /> CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => exportExcel(rows, columns, fileName)}
      >
        <DownloadIcon /> Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => exportPdf(rows, columns, title, summaryLines)}
      >
        <DownloadIcon /> PDF
      </Button>
    </div>
  );
}
