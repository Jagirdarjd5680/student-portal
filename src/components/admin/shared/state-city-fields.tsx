"use client";

import { cityOptions, STATE_OPTIONS } from "@/data/india";
import FormField from "./form-field";
import SelectBox from "./select-field";

interface StateCityFieldsProps {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
  stateError?: string;
  cityError?: string;
}

// State dropdown (all Indian states) + City dropdown for the chosen state.
export default function StateCityFields({
  state,
  city,
  onStateChange,
  onCityChange,
  required,
  stateError,
  cityError,
}: StateCityFieldsProps) {
  return (
    <>
      <FormField label="State" required={required} error={stateError}>
        <SelectBox
          options={STATE_OPTIONS}
          value={state}
          placeholder="Select State"
          invalid={Boolean(stateError)}
          onChange={(v) => {
            onStateChange(v);
            onCityChange("");
          }}
        />
      </FormField>
      <FormField label="City" required={required} error={cityError}>
        <SelectBox
          options={cityOptions(state)}
          value={city}
          placeholder={state ? "Select City" : "Select State first"}
          disabled={!state}
          invalid={Boolean(cityError)}
          onChange={onCityChange}
        />
      </FormField>
    </>
  );
}
