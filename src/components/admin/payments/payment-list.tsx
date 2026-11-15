"use client";

import { useCan } from "@/hooks/use-can";
import DataTable from "@/components/admin/shared/data-table";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi, useDebounce } from "@/hooks/use-api";
import { Link } from "@/i18n/navigation";
import { FilePdfIcon, PlusIcon } from "@/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentService } from "@/services";
import { useState } from "react";
import { useInvoiceDownload } from "./invoice";

export default function PaymentList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const invoice = useInvoiceDownload();
  const canAdd = useCan()("payments", "add");
  const q = useDebounce(search);
  const { data, loading, error } = useApi(
    () => paymentService.list({ search: q }),
    [q],
  );
  const rows = data || [];

  return (
    <>
      <TableCard
        title="All Payments"
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search invoice, student, course..."
        actions={
          canAdd ? (
            <Button nativeButton={false} render={<Link href="/payments/add" />}>
              <PlusIcon /> Add Payment
            </Button>
          ) : undefined
        }
        footer={
          <TablePagination
            total={rows.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        }
      >
        {(error || invoice.error) && (
          <p className="px-6 pb-3 text-sm text-red-500">
            {error || invoice.error}
          </p>
        )}
        <DataTable
          loading={loading}
          rows={paginate(rows, page, pageSize)}
          rowKey={(r) => r.id}
          emptyText="No payments found"
          columns={[
            {
              header: "Invoice #",
              cell: (r) => (
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {r.invoice_no}
                </span>
              ),
            },
            {
              header: "Student",
              cell: (r) => (
                <div>
                  <p className="text-gray-800 dark:text-white/90">
                    {r.student_name}
                  </p>
                  <span className="text-xs">{r.student_code}</span>
                </div>
              ),
            },
            { header: "Course", cell: (r) => r.course_name || "-" },
            { header: "Amount", cell: (r) => formatCurrency(r.amount) },
            { header: "Date", cell: (r) => formatDate(r.payment_date) },
            {
              header: "Method",
              cell: (r) => (
                <Badge size="sm" color="success">
                  {r.method}
                </Badge>
              ),
            },
            { header: "Transaction ID", cell: (r) => r.transaction_id || "-" },
            {
              header: "Invoice",
              cell: (r) => (
                <Button
                  size="xs"
                  variant="outline"
                  loading={invoice.busyId === r.id}
                  onClick={() => invoice.download(r.id)}
                >
                  {invoice.busyId !== r.id && (
                    <FilePdfIcon className="size-4" />
                  )}
                  Download
                </Button>
              ),
            },
          ]}
        />
      </TableCard>
    </>
  );
}
