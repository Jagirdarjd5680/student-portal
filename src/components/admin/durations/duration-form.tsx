"use client";

import FormDialog from "@/components/admin/shared/form-dialog";
import FormField from "@/components/admin/shared/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/format";
import { durationService } from "@/services";
import type { Duration } from "@/types";
import { useEffect, useState } from "react";

interface DurationFormProps {
  open: boolean;
  duration: Duration | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DurationForm({
  open,
  duration,
  onClose,
  onSaved,
}: DurationFormProps) {
  const [form, setForm] = useState({ name: "", days: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; days?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: duration?.name || "",
      days: duration ? String(duration.days) : "",
      description: duration?.description || "",
    });
    setErrors({});
    setError(null);
  }, [open, duration]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^\d+$/.test(form.days)) next.days = "Days must be a number";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setError(null);
    try {
      await durationService.save(form, duration?.id);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={duration ? "Edit Duration" : "Add Duration"}
      error={error}
      submitting={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Name" required error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='e.g. "3 Months"'
        />
      </FormField>
      <FormField label="Days" required error={errors.days}>
        <Input
          value={form.days}
          inputMode="numeric"
          onChange={(e) => setForm({ ...form, days: e.target.value })}
          placeholder="e.g. 90"
        />
      </FormField>
      <FormField label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </FormField>
    </FormDialog>
  );
}
