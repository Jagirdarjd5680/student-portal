"use client";

import FormDialog from "@/components/admin/shared/form-dialog";
import FormField from "@/components/admin/shared/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/format";
import { categoryService } from "@/services";
import type { Category } from "@/types";
import { useEffect, useState } from "react";

interface CategoryFormProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CategoryForm({
  open,
  category,
  onClose,
  onSaved,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name || "");
    setDescription(category?.description || "");
    setError(null);
    setNameError(undefined);
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return setNameError("Name is required");
    setSaving(true);
    setError(null);
    try {
      await categoryService.save({ name, description }, category?.id);
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
      title={category ? "Edit Category" : "Add Category"}
      error={error}
      submitting={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Name" required error={nameError}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
      </FormField>
      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </FormField>
    </FormDialog>
  );
}
