"use client";

import { useCan } from "@/hooks/use-can";
import DataTable from "@/components/admin/shared/data-table";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { useApi, useDebounce } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import { refundService } from "@/services";
import { useState } from "react";
import RefundForm from "./refund-form";

export default function Refunds() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const q = useDebounce(search);
  const { data, loading, reload } = useApi(
    () => refundService.list({ search: q }),
    [q],
  );
  const rows = data || [];
  const canAdd = useCan()("refunds", "add");

  return (
    <div className="space-y-6">
      {canAdd && <RefundForm onSaved={reload} />}

      <TableCard
        title="Refund History"
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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
        <DataTable
          loading={loading}
          rows={paginate(rows, page, pageSize)}
          rowKey={(r) => r.id}
          emptyText="No refunds found"
          columns={[
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
            { header: "Amount", cell: (r) => formatCurrency(r.amount) },
            { header: "Date", cell: (r) => formatDate(r.refund_date) },
            {
              header: "Method",
              cell: (r) => (
                <Badge size="sm" color="warning">
                  {r.method}
                </Badge>
              ),
            },
            { header: "Transaction ID", cell: (r) => r.transaction_id || "-" },
            { header: "Description", cell: (r) => r.description || "-" },
          ]}
        />
      </TableCard>
    </div>
  );
}
