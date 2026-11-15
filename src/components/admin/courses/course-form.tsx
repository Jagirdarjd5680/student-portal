"use client";

import FormDialog from "@/components/admin/shared/form-dialog";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import {
  useCategories,
  useDurations,
} from "@/components/admin/shared/use-lookups";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/format";
import { courseService } from "@/services";
import type { Course } from "@/types";
import { useEffect, useState } from "react";

interface CourseFormProps {
  open: boolean;
  course: Course | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY = {
  name: "",
  category_id: "",
  fee: "",
  duration_id: "",
  description: "",
};

export default function CourseForm({
  open,
  course,
  onClose,
  onSaved,
}: CourseFormProps) {
  const { categoryOptions } = useCategories();
  const { durationOptions } = useDurations();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<{ name?: string; fee?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      course
        ? {
            name: course.name,
            category_id: course.category_id ? String(course.category_id) : "",
            fee: String(course.fee),
            duration_id: course.duration_id ? String(course.duration_id) : "",
            description: course.description || "",
          }
        : EMPTY,
    );
    setErrors({});
    setError(null);
  }, [open, course]);

  const set = (key: keyof typeof EMPTY) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Course Name is required";
    if (!/^\d+(\.\d{1,2})?$/.test(form.fee)) next.fee = "Enter a valid fee";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setError(null);
    try {
      await courseService.save(form, course?.id);
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
      title={course ? "Edit Course" : "Add Course"}
      error={error}
      submitting={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Course Name" required error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder="Course name"
        />
      </FormField>
      <FormField label="Category">
        <SelectBox
          options={categoryOptions}
          value={form.category_id}
          onChange={set("category_id")}
          placeholder="Select Category"
        />
      </FormField>
      <FormField label="Fee" required error={errors.fee}>
        <Input
          value={form.fee}
          inputMode="decimal"
          onChange={(e) => set("fee")(e.target.value)}
          placeholder="0.00"
        />
      </FormField>
      <FormField label="Duration">
        <SelectBox
          options={durationOptions}
          value={form.duration_id}
          onChange={set("duration_id")}
          placeholder="Select Duration"
        />
      </FormField>
      <FormField label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={3}
        />
      </FormField>
    </FormDialog>
  );
}
