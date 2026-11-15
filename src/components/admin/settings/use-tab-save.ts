"use client";

import { errorMessage } from "@/lib/format";
import { settingsService, type AppSettings } from "@/services";
import { useState } from "react";

export interface TabProps {
  initial: AppSettings;
  /** Called after a successful save so the page reloads fresh values. */
  onSaved: () => Promise<unknown> | void;
  /** No edit permission: fields are locked and Save is hidden. */
  canEdit?: boolean;
}

/** Local edit state for one settings tab; only that tab's keys are saved. */
export function useTabSave<K extends keyof AppSettings>(
  initial: AppSettings,
  keys: readonly K[],
  onSaved: TabProps["onSaved"],
) {
  const [values, setValues] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <T extends keyof AppSettings>(key: T, value: AppSettings[T]) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: Partial<AppSettings> = {};
      for (const k of keys) (body as Record<string, unknown>)[k] = values[k];
      await settingsService.save(body);
      await onSaved();
      setSaved(true);
      // A saved password is never echoed back, so clear the field.
      setValues((v) => ({ ...v, smtp_pass: "" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { values, set, save, saving, error, saved, setValues };
}
