"use client";

import DateInput from "@/components/admin/shared/date-input";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_OPTIONS } from "@/data/options";
import type { Option } from "@/types";

export interface TransactionForm {
  student_id: string;
  amount: string;
  date: string;
  method: string;
  transaction_id: string;
  description: string;
}

export type TransactionErrors = Partial<Record<keyof TransactionForm, string>>;

interface TransactionFieldsProps {
  form: TransactionForm;
  errors: TransactionErrors;
  studentOptions: Option[];
  amountLabel: string;
  dateLabel: string;
  amountHint?: string;
  descriptionPlaceholder?: string;
  onChange: (key: keyof TransactionForm, value: string) => void;
}

// Shared fields for Add Payment and Issue Refund forms.
export default function TransactionFields({
  form,
  errors,
  studentOptions,
  amountLabel,
  dateLabel,
  amountHint,
  descriptionPlaceholder,
  onChange,
}: TransactionFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormField
        label="Student"
        required
        error={errors.student_id}
        className="md:col-span-2"
      >
        <SelectBox
          options={studentOptions}
          value={form.student_id}
          onChange={(v) => onChange("student_id", v)}
          placeholder="Select Student"
          invalid={Boolean(errors.student_id)}
        />
      </FormField>
      <FormField label={amountLabel} required error={errors.amount}>
        <Input
          value={form.amount}
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={errors.amount ? "true" : undefined}
          onChange={(e) => onChange("amount", e.target.value)}
        />
        {amountHint && !errors.amount && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {amountHint}
          </p>
        )}
      </FormField>
      <FormField label={dateLabel} required error={errors.date}>
        <DateInput
          value={form.date}
          onChange={(v) => onChange("date", v)}
          invalid={Boolean(errors.date)}
        />
      </FormField>
      <FormField label="Payment Method" required error={errors.method}>
        <SelectBox
          options={PAYMENT_METHOD_OPTIONS}
          value={form.method}
          onChange={(v) => onChange("method", v)}
          placeholder="Select Method"
          invalid={Boolean(errors.method)}
        />
      </FormField>
      <FormField label="Transaction ID">
        <Input
          value={form.transaction_id}
          placeholder="Optional"
          onChange={(e) => onChange("transaction_id", e.target.value)}
        />
      </FormField>
      <FormField label="Description" className="md:col-span-2">
        <Textarea
          value={form.description}
          rows={3}
          placeholder={descriptionPlaceholder}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </FormField>
    </div>
  );
}

// Basic validation shared by both forms.
export function validateTransaction(form: TransactionForm, maxAmount?: number) {
  const errors: TransactionErrors = {};
  const amount = Number(form.amount);
  if (!form.student_id) errors.student_id = "Student is required";
  if (!/^\d+(\.\d{1,2})?$/.test(form.amount) || amount <= 0) {
    errors.amount = "Enter a valid amount";
  } else if (maxAmount !== undefined && amount > maxAmount) {
    errors.amount = `Amount cannot be more than ₹${maxAmount.toFixed(2)}`;
  }
  if (!form.date) errors.date = "Date is required";
  if (!form.method) errors.method = "Payment Method is required";
  return errors;
}
