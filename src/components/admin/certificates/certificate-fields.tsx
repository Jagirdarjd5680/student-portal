"use client";

import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { MAX_FILE_MB } from "@/data/options";
import type { Option } from "@/types";

export interface CertificateForm {
  student_id: string;
  title: string;
  code: string;
}

export type CertificateErrors = Partial<
  Record<keyof CertificateForm | "file", string>
>;

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*";

export function validateCertificate(
  form: CertificateForm,
  file: File | null,
  needFile: boolean,
): CertificateErrors {
  const e: CertificateErrors = {};
  if (!form.student_id) e.student_id = "Student is required";
  if (!form.title.trim()) e.title = "Certificate title is required";
  if (!form.code.trim()) e.code = "Certificate code is required";
  if (needFile && !file)
    e.file = "Please attach the certificate (PDF or image)";
  if (file && file.size > MAX_FILE_MB * 1024 * 1024)
    e.file = `File must be less than ${MAX_FILE_MB}MB`;
  return e;
}

interface CertificateFieldsProps {
  form: CertificateForm;
  errors: CertificateErrors;
  studentOptions: Option[];
  onChange: (key: keyof CertificateForm, value: string) => void;
  onFile: (file: File | null) => void;
  /** Shown when editing: the file already attached. */
  currentFile?: string | null;
  resetKey?: number;
}

// Student, certificate title, certificate code and the file: used by Issue and Edit.
export default function CertificateFields({
  form,
  errors,
  studentOptions,
  onChange,
  onFile,
  currentFile,
  resetKey,
}: CertificateFieldsProps) {
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
      <FormField label="Certificate Title" required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Certificate of Completion"
          aria-invalid={errors.title ? "true" : undefined}
        />
      </FormField>
      <FormField label="Certificate Code" required error={errors.code}>
        <Input
          value={form.code}
          onChange={(e) => onChange("code", e.target.value)}
          placeholder="e.g. GOG-2026-0001"
          aria-invalid={errors.code ? "true" : undefined}
        />
      </FormField>
      <FormField
        label={
          currentFile
            ? "Replace Certificate File (optional)"
            : "Certificate File (image or PDF)"
        }
        required={!currentFile}
        error={errors.file}
        className="md:col-span-2"
      >
        <FileInput
          key={resetKey}
          accept={ACCEPT}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentFile
            ? `Current file: ${currentFile}. A new file replaces it (the old one is deleted from the server).`
            : `PDF, JPG, PNG or WEBP, up to ${MAX_FILE_MB}MB.`}
        </p>
      </FormField>
    </div>
  );
}
