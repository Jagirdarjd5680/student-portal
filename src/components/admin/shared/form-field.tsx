"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

// Label + control + error message, styled like the template forms.
export default function FormField({
  label,
  required,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)} className={cn(className)}>
      <FieldLabel className="mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      {children}
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
