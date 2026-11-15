"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { Option } from "@/types";
import { cn } from "@/utils";

interface SelectBoxProps {
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

// Searchable dropdown (type to filter) built on the template's Combobox primitive.
export default function SelectBox({
  options,
  value,
  onChange,
  placeholder = "Select Option",
  disabled,
  invalid,
  className,
  size = "default",
}: SelectBoxProps) {
  const selected = options.find((o) => o.value === String(value ?? "")) ?? null;

  return (
    <Combobox<Option>
      items={options}
      value={selected}
      onValueChange={(o) => onChange(o ? String(o.value) : "")}
      itemToStringLabel={(o) => o?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid ? "true" : undefined}
        className={cn(
          size === "sm" && "h-9",
          size === "default" && "h-11",
          size === "lg" && "h-12",
          className,
        )}
      />
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {(o: Option) => (
            <ComboboxItem key={o.value} value={o}>
              {o.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
