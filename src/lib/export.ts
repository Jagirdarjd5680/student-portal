// Client-side export helpers: CSV, Excel (.xls via HTML table) and PDF (print).
export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function download(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  name: string,
) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    columns.map((c) => esc(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => esc(c.value(r))).join(",")),
  ];
  download("﻿" + lines.join("\n"), `${name}.csv`, "text/csv;charset=utf-8");
}

function htmlTable<T>(rows: T[], columns: ExportColumn<T>[]) {
  const head = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(c.value(r))}</td>`).join("")}</tr>`,
    )
    .join("");
  return `<table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function exportExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  name: string,
) {
  const html = `<html><head><meta charset="utf-8" /></head><body>${htmlTable(rows, columns)}</body></html>`;
  download(html, `${name}.xls`, "application/vnd.ms-excel");
}

// Opens a print window — choose "Save as PDF" in the print dialog.
export function exportPdf<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string,
  summaryLines: string[] = [],
) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document
    .write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#1d2939}
      h2{margin:0 0 8px} p{margin:2px 0;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:11px}
      th,td{border:1px solid #d0d5dd;padding:6px;text-align:left}
      th{background:#f2f4f7}
    </style></head><body>
    <h2>${escapeHtml(title)}</h2>
    ${summaryLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
    ${htmlTable(rows, columns)}
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
