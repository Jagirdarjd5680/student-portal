"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import { Button } from "@/components/ui/button";
import { errorMessage, formatCurrency, todaySql } from "@/lib/format";
import { paymentService } from "@/services";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useInvoiceDownload } from "./invoice";
import StudentFeePanel from "./student-fee-panel";
import TransactionFields, {
  validateTransaction,
  type TransactionErrors,
  type TransactionForm,
} from "./transaction-fields";
import { useStudentOptions } from "./use-student-options";

const emptyForm = (studentId = ""): TransactionForm => ({
  student_id: studentId,
  amount: "",
  date: todaySql(),
  method: "",
  transaction_id: "",
  description: "",
});

export default function PaymentForm() {
  const params = useSearchParams();
  const { students, options, reload } = useStudentOptions();
  const [form, setForm] = useState(() =>
    emptyForm(params.get("student") || ""),
  );
  const [errors, setErrors] = useState<TransactionErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const invoice = useInvoiceDownload();
  const [lastId, setLastId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Keep the panel on the student just paid for, so the new balance shows.
  const [panelStudent, setPanelStudent] = useState(form.student_id);
  const panelId = form.student_id || panelStudent;

  const student = students.find((s) => String(s.id) === form.student_id);
  const balance = student ? Number(student.balance) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateTransaction(form, balance);
    if (balance !== undefined && balance <= 0)
      next.amount = "This student has no remaining balance";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await paymentService.create({
        student_id: form.student_id,
        amount: form.amount,
        payment_date: form.date,
        method: form.method,
        transaction_id: form.transaction_id,
        description: form.description,
      });
      setMessage({
        type: "success",
        text: `Payment saved. Invoice No: ${res.invoice_no}`,
      });
      setLastId(res.id);
      invoice.download(res.id);
      setPanelStudent(form.student_id);
      setForm(emptyForm());
      setRefreshKey((k) => k + 1);
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ComponentCard title="Add Payment">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 xl:col-span-3"
        >
          <FormAlert
            type={message?.type ?? "success"}
            message={message?.text}
          />
          <FormAlert type="error" message={invoice.error} />

          <TransactionFields
            form={form}
            errors={errors}
            studentOptions={options}
            amountLabel="Payment Amount"
            dateLabel="Payment Date"
            amountHint={
              student
                ? `Remaining balance: ${formatCurrency(student.balance)}`
                : undefined
            }
            descriptionPlaceholder='e.g. "First EMI"'
            onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
          />

          <div className="flex justify-end gap-3">
            {lastId && (
              <Button
                type="button"
                variant="outline"
                loading={invoice.busyId === lastId}
                onClick={() => invoice.download(lastId)}
              >
                Download Last Invoice
              </Button>
            )}
            <Button type="submit" loading={saving}>
              {saving ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        </form>

        <aside className="xl:sticky xl:top-24 xl:col-span-2 xl:self-start">
          <StudentFeePanel
            studentId={panelId}
            amount={form.amount}
            refreshKey={refreshKey}
            onPickAmount={(amount) =>
              setForm((f) => ({ ...f, student_id: panelId, amount }))
            }
          />
        </aside>
      </div>
    </ComponentCard>
  );
}
