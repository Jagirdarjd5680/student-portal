"use client";

import FormDialog from "@/components/admin/shared/form-dialog";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MATERIAL_FILE_ACCEPT, MATERIAL_TYPE_OPTIONS } from "@/data/options";
import { toFormData } from "@/lib/api-client";
import { errorMessage } from "@/lib/format";
import { studyMaterialService } from "@/services";
import type { StudyMaterial } from "@/types";
import { useEffect, useState } from "react";
import TopicField from "./topic-field";

interface MaterialFormProps {
  open: boolean;
  material: StudyMaterial | null;
  courseId: string;
  durationId: string;
  topics: string[];
  onClose: () => void;
  onSaved: () => void;
}

type Errors = { topic?: string; material_type?: string; title?: string };

export default function MaterialForm({
  open,
  material,
  courseId,
  durationId,
  topics,
  onClose,
  onSaved,
}: MaterialFormProps) {
  const [form, setForm] = useState({
    topic: "",
    material_type: "",
    title: "",
    content: "",
  });
  const [newTopic, setNewTopic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      topic: material?.topic || "",
      material_type: material?.material_type || "",
      title: material?.title || "",
      content: material?.content || "",
    });
    setNewTopic(!material && topics.length === 0);
    setFile(null);
    setErrors({});
    setError(null);
  }, [open, material, topics.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (!form.topic.trim()) next.topic = "Topic is required";
    if (!form.material_type) next.material_type = "Material Type is required";
    if (!form.title.trim()) next.title = "Title is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setError(null);
    try {
      const body = toFormData(
        { ...form, course_id: courseId, duration_id: durationId },
        { file },
      );
      await studyMaterialService.save(body, material?.id);
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
      title={material ? "Edit Study Material" : "Add Study Material"}
      error={error}
      submitting={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
    >
      <TopicField
        topics={topics}
        value={form.topic}
        isNew={newTopic}
        error={errors.topic}
        onChange={(topic, isNew) => {
          setNewTopic(isNew);
          setForm((f) => ({ ...f, topic }));
        }}
      />
      <FormField label="Material Type" required error={errors.material_type}>
        <SelectBox
          options={MATERIAL_TYPE_OPTIONS}
          value={form.material_type}
          placeholder="Select Type"
          invalid={Boolean(errors.material_type)}
          onChange={(v) => setForm((f) => ({ ...f, material_type: v }))}
        />
      </FormField>
      <FormField label="Title" required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </FormField>
      <FormField label="Content / Description">
        <Textarea
          rows={4}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        />
      </FormField>
      <FormField label="Upload File (PDF, JPG, PNG, GIF, DOC, DOCX)">
        <FileInput
          accept={MATERIAL_FILE_ACCEPT}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {material?.file_path && !file && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A file is already attached. Choose a new one to replace it.
          </p>
        )}
      </FormField>
    </FormDialog>
  );
}
