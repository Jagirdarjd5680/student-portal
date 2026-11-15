"use client";

import { toast } from "sonner";
import { useCan } from "@/hooks/use-can";
import { useInvoiceDownload } from "@/components/admin/payments/invoice";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import FormAlert from "@/components/admin/shared/form-alert";
import StatGrid from "@/components/admin/shared/stat-grid";
import TableCard from "@/components/admin/shared/table-card";
import { Button } from "@/components/ui/button";
import { ProfilePageSkeleton } from "@/components/admin/shared/skeletons";
import { useApi } from "@/hooks/use-api";
import { Link } from "@/i18n/navigation";
import {
  DollarIcon,
  PencilIcon,
  PlusIcon,
  FilePdfIcon,
  TagIcon,
  TicketIcon,
  UserDollarIcon,
} from "@/icons";
import { errorMessage, formatCurrency, formatDate } from "@/lib/format";
import { paymentService, studentService } from "@/services";
import type { Payment } from "@/types";
import { takeFlash } from "@/lib/flash";
import { useState } from "react";
import ProfileCard from "./profile-card";

export default function StudentView({ id }: { id: string }) {
  const {
    data: s,
    loading,
    error,
    reload,
  } = useApi(() => studentService.get(id), [id]);
  const invoice = useInvoiceDownload();
  const can = useCan();
  const canEdit = can("students", "edit");
  const canPay = can("payments", "add");
  const canDeletePayment = can("payments", "delete");
  const canInvoice = can("payments", "view");
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [flash] = useState(() => takeFlash()); // e.g. "Email with PDF sent to …"

  if (loading && !s) return <ProfilePageSkeleton />;
  if (error || !s)
    return <FormAlert inline type="error" message={error || "Student not found"} />;

  const deletePayment = async () => {
    if (!deleting) return;
    try {
      await paymentService.remove(deleting.id);
      toast.success("Payment deleted successfully");
      setDeleting(null);
      await reload();
    } catch (err) {
      setDeleting(null);
      setActionError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-3">
        {canEdit && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/students/${s.id}/edit`} />}
          >
            <PencilIcon className="size-4" /> Edit Student
          </Button>
        )}
        {canPay && (
          <Button
            nativeButton={false}
            render={<Link href={`/payments/add?student=${s.id}`} />}
          >
            <PlusIcon /> Add Payment
          </Button>
        )}
      </div>

      <ProfileCard student={s} />

      <StatGrid
        items={[
          {
            title: "Total Fee",
            value: formatCurrency(s.total_fee),
            icon: <TicketIcon />,
            hint: `Course fee ${formatCurrency(s.course_fee)}`,
          },
          {
            title: "Discount",
            value: formatCurrency(s.discount_amount),
            icon: <TagIcon />,
            hint:
              s.discount_type === "percentage"
                ? `${s.discount_value}%`
                : "Fixed Amount",
          },
          {
            title: "Total Paid",
            value: formatCurrency(s.total_paid),
            icon: <DollarIcon />,
          },
          {
            title: "Remaining Balance",
            value: formatCurrency(s.balance),
            icon: <UserDollarIcon />,
          },
        ]}
      />

      {flash && <FormAlert type={flash.type} message={flash.text} />}
      <FormAlert type="error" message={actionError || invoice.error} />

      <TableCard title="Payment History">
        <DataTable
          rows={s.payments}
          rowKey={(r) => r.id}
          emptyText="No payments yet"
          columns={[
            {
              header: "Invoice #",
              cell: (r) => (
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {r.invoice_no}
                </span>
              ),
            },
            { header: "Amount", cell: (r) => formatCurrency(r.amount) },
            { header: "Date", cell: (r) => formatDate(r.payment_date) },
            { header: "Method", cell: (r) => r.method },
            { header: "Transaction ID", cell: (r) => r.transaction_id || "-" },
            { header: "Description", cell: (r) => r.description || "-" },
            {
              header: "Actions",
              cell: (r) => (
                <div className="flex gap-2">
                  {canInvoice && (
                    <Button
                      size="xs"
                      variant="outline"
                      loading={invoice.busyId === r.id}
                      onClick={() => invoice.download(r.id)}
                    >
                      {invoice.busyId !== r.id && (
                        <FilePdfIcon className="size-4" />
                      )}
                      Invoice
                    </Button>
                  )}
                  {canDeletePayment && (
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => setDeleting(r)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </TableCard>
      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Delete payment ${deleting?.invoice_no} of ${formatCurrency(deleting?.amount)}?`}
        onConfirm={deletePayment}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
