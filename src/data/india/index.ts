import type { Option } from "@/types";
import { STATES_A_J } from "./states-a-j";
import { STATES_K_Z } from "./states-k-z";

export const INDIA_STATES: Record<string, string[]> = {
  ...STATES_A_J,
  ...STATES_K_Z,
};

export const STATE_OPTIONS: Option[] = Object.keys(INDIA_STATES)
  .sort()
  .map((s) => ({ label: s, value: s }));

export function cityOptions(state?: string | null): Option[] {
  if (!state) return [];
  return (INDIA_STATES[state] || []).map((c) => ({ label: c, value: c }));
}
