"use client";

import { Input } from "@/components/ui/input";
import { stripLeadingZeros } from "@/lib/format";

// Phone field that drops leading zeros as you type or paste.
// Works with react-hook-form's `register(...)` (the cleaned value is what RHF reads).
export default function PhoneInput({
  onChange,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      {...props}
      onChange={(e) => {
        const clean = stripLeadingZeros(e.target.value);
        if (clean !== e.target.value) e.target.value = clean;
        onChange?.(e);
      }}
    />
  );
}
