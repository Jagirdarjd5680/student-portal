"use client";

import { useApi } from "@/hooks/use-api";
import {
  categoryService,
  courseService,
  durationService,
  receptionistService,
} from "@/services";
import type { Option } from "@/types";
import { useMemo } from "react";

const toOptions = (rows: { id: number; name: string }[] | null): Option[] =>
  (rows || []).map((r) => ({ label: r.name, value: String(r.id) }));

// Dropdown data shared by many forms.
export function useCourses() {
  const { data, loading } = useApi(() => courseService.list());
  const options = useMemo(() => toOptions(data), [data]);
  return { courses: data || [], courseOptions: options, loading };
}

export function useDurations() {
  const { data, loading } = useApi(() => durationService.list());
  const options = useMemo(() => toOptions(data), [data]);
  return { durations: data || [], durationOptions: options, loading };
}

export function useCategories() {
  const { data, loading } = useApi(() => categoryService.list());
  const options = useMemo(() => toOptions(data), [data]);
  return { categories: data || [], categoryOptions: options, loading };
}

/** Receptionist dropdown = role users with category "Receptionist". */
export function useReceptionists({ includeInactive = false } = {}) {
  const { data } = useApi(
    () => receptionistService.list(includeInactive),
    [includeInactive],
  );
  return useMemo(() => toOptions(data), [data]);
}

/** Add the receptionist already saved on a record, even if that person is no longer selectable. */
export function withCurrentOption(
  options: Option[],
  id?: number | string | null,
  name?: string | null,
): Option[] {
  if (!id || !name || options.some((o) => o.value === String(id)))
    return options;
  return [...options, { value: String(id), label: name }];
}
