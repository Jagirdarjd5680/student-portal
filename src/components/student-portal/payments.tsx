"use client";

import DataTable from "@/components/admin/shared/data-table";
import StatGrid from "@/components/admin/shared/stat-grid";
import TableCard from "@/components/admin/shared/table-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadInvoicePdf } from "@/components/admin/payments/invoice/invoice-pdf";
import { useApi } from "@/hooks/use-api";
import { DollarIcon, FilePdfIcon, TicketIcon, UserDollarIcon } from "@/icons";
import { errorMessage, formatCurrency, formatDate } from "@/lib/format";
import { studentPortalService } from "@/services";
import { useState } from "react";
import { useStudent } from "./context";

// Fee summary + the student's own payments, each with a direct invoice download.
export default function StudentPayments() {
  const { me } = useStudent();
  const { data, loading, error } = useApi(() =>
    studentPortalService.payments(),
  );
  const [busyId, setBusyId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const download = async (id: number) => {
    setBusyId(id);
    setDownloadError(null);
    try {
      await downloadInvoicePdf(await studentPortalService.invoice(id));
    } catch (err) {
      setDownloadError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const fees = me?.fees;

  return (
    <div className="space-y-6">
      <StatGrid
        className="xl:grid-cols-3"
        loading={!fees}
        items={[
          {
            title: "Net Fee",
            value: fees ? formatCurrency(fees.total_fee) : "-",
            icon: <TicketIcon />,
          },
          {
            title: "Total Paid",
            value: fees ? formatCurrency(fees.total_paid) : "-",
            icon: <DollarIcon />,
          },
          {
            title: "Balance",
            value: fees ? formatCurrency(Math.max(0, fees.balance)) : "-",
            icon: <UserDollarIcon />,
            hint: fees && fees.balance <= 0 ? "Fully paid" : undefined,
          },
        ]}
      />

      <TableCard title="Payment History">
        {(error || downloadError) && (
          <p className="px-6 pb-3 text-sm text-red-500">
            {error || downloadError}
          </p>
        )}
        <DataTable
          loading={loading}
          rows={data || []}
          rowKey={(r) => r.id}
          emptyText="No payments yet"
          hoverable
          columns={[
            {
              header: "Invoice No",
              cell: (r) => (
                <span className="font-semibold whitespace-nowrap text-gray-800 dark:text-white/90">
                  {r.invoice_no}
                </span>
              ),
            },
            {
              header: "Date",
              className: "whitespace-nowrap",
              cell: (r) => formatDate(r.payment_date),
            },
            {
              header: "Amount",
              cell: (r) => (
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {formatCurrency(r.amount)}
                </span>
              ),
            },
            {
              header: "Method",
              cell: (r) => (
                <Badge size="sm" color="success">
                  {r.method}
                </Badge>
              ),
            },
            { header: "Transaction ID", cell: (r) => r.transaction_id || "-" },
            { header: "Note", cell: (r) => r.description || "-" },
            {
              header: "Invoice",
              cell: (r) => (
                <Button
                  size="xs"
                  variant="outline"
                  loading={busyId === r.id}
                  onClick={() => download(r.id)}
                >
                  {busyId !== r.id && <FilePdfIcon className="size-4" />}
                  Download
                </Button>
              ),
            },
          ]}
        />
      </TableCard>
    </div>
  );
}
