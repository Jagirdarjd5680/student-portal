"use client";

import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { Input } from "@/components/ui/input";

const NEW_TOPIC = "__new__";

interface TopicFieldProps {
  topics: string[];
  value: string;
  isNew: boolean;
  error?: string;
  onChange: (topic: string, isNew: boolean) => void;
}

// Pick an existing topic or create a new one.
export default function TopicField({
  topics,
  value,
  isNew,
  error,
  onChange,
}: TopicFieldProps) {
  const options = [
    ...topics.map((t) => ({ label: t, value: t })),
    { label: "+ Create New Topic", value: NEW_TOPIC },
  ];

  return (
    <FormField label="Topic" required error={error}>
      <SelectBox
        options={options}
        value={isNew ? NEW_TOPIC : value}
        placeholder="Select Topic"
        invalid={Boolean(error) && !isNew}
        onChange={(v) =>
          v === NEW_TOPIC ? onChange("", true) : onChange(v, false)
        }
      />
      {isNew && (
        <Input
          value={value}
          placeholder="Enter new topic name"
          aria-invalid={error ? "true" : undefined}
          onChange={(e) => onChange(e.target.value, true)}
        />
      )}
    </FormField>
  );
}
