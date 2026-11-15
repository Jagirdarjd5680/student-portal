"use client";

import { FileInput } from "@/components/ui/file-input";
import { MAX_PHOTO_MB } from "@/data/options";
import { useEffect, useMemo } from "react";

interface PhotoInputProps {
  file: File | null;
  onChange: (file: File | null, error?: string) => void;
  existingUrl?: string;
  resetKey?: number;
}

// Image picker with preview and max-size check (10MB).
export default function PhotoInput({
  file,
  onChange,
  existingUrl,
  resetKey,
}: PhotoInputProps) {
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const src = preview || existingUrl;

  return (
    <div className="flex items-center gap-4">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Photo"
          className="size-14 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-800"
        />
      )}
      <FileInput
        key={resetKey}
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f && f.size > MAX_PHOTO_MB * 1024 * 1024) {
            e.target.value = "";
            onChange(null, `Photo must be less than ${MAX_PHOTO_MB}MB`);
            return;
          }
          onChange(f);
        }}
      />
    </div>
  );
}
