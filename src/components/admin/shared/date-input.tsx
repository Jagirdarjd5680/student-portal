"use client";

import { Input } from "@/components/ui/input";
import { CalendarIcon } from "@/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";

interface DateInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}

// Controlled flatpickr date input. Value format: YYYY-MM-DD
export default function DateInput({
  value,
  onChange,
  placeholder = "Select date",
  invalid,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      mode: "single",
      // Display format only. The form value is always emitted as Y-m-d.
      // (No altInput: it clones the input and showed two boxes.)
      dateFormat: "d M Y",
      allowInput: false,
      disableMobile: true,
      onChange: (dates, _str, fp) =>
        onChangeRef.current(dates[0] ? fp.formatDate(dates[0], "Y-m-d") : ""),
    });
    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fp = fpRef.current;
    if (!fp) return;
    if (value) fp.setDate(value.slice(0, 10), false, "Y-m-d");
    else fp.clear(false);
  }, [value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="pe-10"
        aria-invalid={invalid ? "true" : undefined}
      />
      <span className="pointer-events-none absolute inset-e-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <CalendarIcon className="size-5" />
      </span>
    </div>
  );
}
