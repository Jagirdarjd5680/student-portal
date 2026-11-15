"use client";

import ComponentCard from "@/components/common/component-card";
import TransactionFields, {
  validateTransaction,
  type TransactionErrors,
  type TransactionForm,
} from "@/components/admin/payments/transaction-fields";
import { useStudentOptions } from "@/components/admin/payments/use-student-options";
import FormAlert from "@/components/admin/shared/form-alert";
import { Button } from "@/components/ui/button";
import { errorMessage, todaySql } from "@/lib/format";
import { refundService } from "@/services";
import { useState } from "react";

const emptyForm = (): TransactionForm => ({
  student_id: "",
  amount: "",
  date: todaySql(),
  method: "",
  transaction_id: "",
  description: "",
});

export default function RefundForm({ onSaved }: { onSaved: () => void }) {
  const { options } = useStudentOptions();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<TransactionErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateTransaction(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setMessage(null);
    try {
      await refundService.create({
        student_id: form.student_id,
        amount: form.amount,
        refund_date: form.date,
        method: form.method,
        transaction_id: form.transaction_id,
        description: form.description,
      });
      setMessage({ type: "success", text: "Refund issued successfully" });
      setForm(emptyForm());
      onSaved();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ComponentCard title="Issue Refund">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormAlert type={message?.type ?? "success"} message={message?.text} />
        <TransactionFields
          form={form}
          errors={errors}
          studentOptions={options}
          amountLabel="Refund Amount"
          dateLabel="Refund Date"
          descriptionPlaceholder="Reason for refund"
          onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Issue Refund"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
