"use client";

import DataTable from "@/components/admin/shared/data-table";
import ExportButtons from "@/components/admin/shared/export-buttons";
import StatGrid from "@/components/admin/shared/stat-grid";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import { useApi } from "@/hooks/use-api";
import {
  BanknoteUndoIcon,
  BarChartIcon,
  DollarIcon,
  PieChartIcon,
} from "@/icons";
import type { ExportColumn } from "@/lib/export";
import { formatCurrency, formatDate } from "@/lib/format";
import { reportService } from "@/services";
import type { Payment } from "@/types";
import { useState } from "react";
import ReportFilters, { EMPTY_FILTERS } from "./report-filters";

const columns: ExportColumn<Payment>[] = [
  { header: "Invoice #", value: (r) => r.invoice_no },
  { header: "Date", value: (r) => formatDate(r.payment_date) },
  { header: "Student", value: (r) => `${r.student_name} (${r.student_code})` },
  { header: "Course", value: (r) => r.course_name || "" },
  { header: "Amount", value: (r) => Number(r.amount).toFixed(2) },
  { header: "Method", value: (r) => r.method },
  { header: "Transaction ID", value: (r) => r.transaction_id || "" },
  { header: "Description", value: (r) => r.description || "" },
];

export default function Reports() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, loading } = useApi(
    () => reportService.payments({ ...applied }),
    [applied],
  );

  const rows = data?.rows || [];
  const s = data?.summary;

  const summaryLines = s
    ? [
        `Total Payments: ${s.totalPayments} (${formatCurrency(s.totalAmount)})`,
        `Total Refunds: ${formatCurrency(s.totalRefunds)}`,
        `Net Income: ${formatCurrency(s.netIncome)}`,
        `Average Payment: ${formatCurrency(s.averagePayment)}`,
      ]
    : [];

  return (
    <div className="space-y-6">
      <StatGrid
        loading={loading}
        items={[
          {
            title: "Total Payments",
            value: s?.totalPayments ?? "-",
            icon: <DollarIcon />,
            hint: s ? formatCurrency(s.totalAmount) : undefined,
          },
          {
            title: "Total Refunds",
            value: s ? formatCurrency(s.totalRefunds) : "-",
            icon: <BanknoteUndoIcon />,
            hint: s ? `${s.refundCount} refunds` : undefined,
          },
          {
            title: "Net Income",
            value: s ? formatCurrency(s.netIncome) : "-",
            icon: <BarChartIcon />,
            hint: "Payments − Refunds",
          },
          {
            title: "Average Payment",
            value: s ? formatCurrency(s.averagePayment) : "-",
            icon: <PieChartIcon />,
          },
        ]}
      />

      <ReportFilters
        value={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
        onClear={() => {
          setFilters(EMPTY_FILTERS);
          setApplied(EMPTY_FILTERS);
          setPage(1);
        }}
      />

      <TableCard
        title="Payment Report"
        actions={
          <ExportButtons
            rows={rows}
            columns={columns}
            fileName="payment-report"
            title="Payment Report"
            summaryLines={summaryLines}
          />
        }
        footer={
          <TablePagination
            total={rows.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      >
        <DataTable
          loading={loading}
          rows={paginate(rows, page, pageSize)}
          rowKey={(r) => r.id}
          emptyText="No payments found"
          columns={columns.map((c) => ({
            header: c.header,
            cell: (r: Payment) => c.value(r) || "-",
          }))}
        />
      </TableCard>
    </div>
  );
}
