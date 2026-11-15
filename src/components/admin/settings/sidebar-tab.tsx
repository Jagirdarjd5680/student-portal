"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/format";
import {
  SIDEBAR_COLOR_KEYS,
  SIDEBAR_DEFAULTS,
  SIDEBAR_PRESET_GROUPS,
  applySidebarTheme,
  cacheSidebarTheme,
  cleanSidebarTheme,
  contrast,
  emptySidebarTheme,
  type SidebarColorKey,
  type SidebarTheme,
} from "@/lib/sidebar-theme";
import { settingsService } from "@/services";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { TabProps } from "./use-tab-save";

const FIELDS: { key: SidebarColorKey; label: string; hint: string }[] = [
  { key: "sb_bg", label: "Sidebar background", hint: "Whole sidebar" },
  { key: "sb_text", label: "Menu text", hint: "Menus that are not selected" },
  {
    key: "sb_active_bg",
    label: "Active menu background",
    hint: "The page you are on",
  },
  {
    key: "sb_active_text",
    label: "Active menu text",
    hint: "The page you are on",
  },
  { key: "sb_hover_bg", label: "Hover background", hint: "Mouse over a menu" },
  { key: "sb_hover_text", label: "Hover text", hint: "Mouse over a menu" },
];

const HEX = /^#[0-9a-f]{6}$/i;

// Pick the colours of the admin sidebar. Every change shows on the real sidebar at once;
// nothing is kept for other users until Save. Reset goes back to the default white look.
export default function SidebarTab({
  initial,
  onSaved,
  canEdit = true,
}: TabProps) {
  const [theme, setTheme] = useState<SidebarTheme>(() =>
    cleanSidebarTheme(initial),
  );
  const savedRef = useRef<SidebarTheme>(cleanSidebarTheme(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live preview on the real sidebar. Leaving the tab without saving puts the saved colours back.
  useEffect(() => {
    applySidebarTheme(theme);
  }, [theme]);
  useEffect(() => () => applySidebarTheme(savedRef.current), []);

  const shown = (k: SidebarColorKey) =>
    HEX.test(theme[k]) ? theme[k] : SIDEBAR_DEFAULTS[k];
  const anyInvalid = SIDEBAR_COLOR_KEYS.some(
    (k) => theme[k] && !HEX.test(theme[k]),
  );
  const dirty = SIDEBAR_COLOR_KEYS.some(
    (k) => theme[k] !== savedRef.current[k],
  );
  const hasSaved = SIDEBAR_COLOR_KEYS.some((k) => savedRef.current[k]);
  const hasAny = SIDEBAR_COLOR_KEYS.some((k) => theme[k]);

  const set = (k: SidebarColorKey, v: string) =>
    setTheme((t) => ({ ...t, [k]: v.toLowerCase() }));

  const persist = async (next: SidebarTheme, message: string) => {
    setSaving(true);
    setError(null);
    try {
      await settingsService.save({ ...next });
      savedRef.current = next;
      cacheSidebarTheme(next);
      setTheme(next);
      toast.success(message);
      await onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const warnings = [
    contrast(shown("sb_text"), shown("sb_bg")) < 3 &&
      "Menu text is hard to read on this background.",
    contrast(shown("sb_active_text"), shown("sb_active_bg")) < 3 &&
      "Active menu text is hard to read on its background.",
    contrast(shown("sb_hover_text"), shown("sb_hover_bg")) < 3 &&
      "Hover text is hard to read on its background.",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      <FormAlert type="error" message={error} />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Change a colour and the sidebar and top bar update straight away. The
        top bar always uses the same background and text colour as the sidebar.
        Press Save Colors to keep it for everyone who uses this panel. These
        colours work in light mode only: in dark mode the default look is used.
      </p>

      {canEdit && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Presets{" "}
            <span className="font-normal text-gray-400">
              (click one to try it, then adjust or save)
            </span>
          </p>
          {SIDEBAR_PRESET_GROUPS.map((g) => (
            <div key={g.group}>
              <p className="mb-1.5 text-xs tracking-wide text-gray-400 uppercase">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-3">
                {g.presets.map((p) => {
                  const on = SIDEBAR_COLOR_KEYS.every(
                    (k) => theme[k] === p.theme[k],
                  );
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setTheme({ ...p.theme })}
                      aria-pressed={on}
                      className={`w-36 rounded-xl border p-2 text-start transition ${
                        on
                          ? "border-brand-500 ring-2 ring-brand-500/30"
                          : "border-gray-200 hover:border-gray-400 dark:border-gray-700"
                      }`}
                    >
                      <span
                        className="block space-y-1 rounded-lg p-1.5"
                        style={{ backgroundColor: p.theme.sb_bg }}
                      >
                        <span
                          className="block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: p.theme.sb_bg,
                            color: p.theme.sb_text,
                          }}
                        >
                          Top bar
                        </span>
                        <span
                          className="block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ color: p.theme.sb_text }}
                        >
                          Menu
                        </span>
                        <span
                          className="block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: p.theme.sb_hover_bg,
                            color: p.theme.sb_hover_text,
                          }}
                        >
                          Hover
                        </span>
                        <span
                          className="block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: p.theme.sb_active_bg,
                            color: p.theme.sb_active_text,
                          }}
                        >
                          Active
                        </span>
                      </span>
                      <span className="mt-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <fieldset
        disabled={!canEdit}
        className="m-0 grid min-w-0 gap-5 border-0 p-0 lg:grid-cols-[1fr_260px]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => {
            const custom = Boolean(theme[f.key]);
            const invalid = custom && !HEX.test(theme[f.key]);
            return (
              <div key={f.key}>
                <label
                  htmlFor={`${f.key}-hex`}
                  className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {f.label}
                  {!custom && (
                    <span className="text-xs font-normal text-gray-400">
                      Default
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={f.label}
                    value={shown(f.key)}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-1 dark:border-gray-700"
                  />
                  <Input
                    id={`${f.key}-hex`}
                    value={theme[f.key]}
                    placeholder={SIDEBAR_DEFAULTS[f.key]}
                    maxLength={7}
                    spellCheck={false}
                    aria-invalid={invalid}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      // Accept "c40c0c" as well as "#c40c0c".
                      set(f.key, v && !v.startsWith("#") ? `#${v}` : v);
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {invalid ? "Use a colour like #c40c0c" : f.hint}
                </p>
              </div>
            );
          })}
        </div>

        {/* Small mock-up so the hover colour can be seen without moving the mouse. */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </p>
          <div
            className="mb-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium dark:border-gray-700"
            style={{ backgroundColor: shown("sb_bg"), color: shown("sb_text") }}
          >
            Top bar
          </div>
          <div
            className="space-y-1 rounded-xl border border-gray-200 p-3 text-sm font-medium dark:border-gray-700"
            style={{ backgroundColor: shown("sb_bg") }}
          >
            <div
              className="rounded-lg px-3 py-2"
              style={{ color: shown("sb_text") }}
            >
              Normal menu
            </div>
            <div
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: shown("sb_hover_bg"),
                color: shown("sb_hover_text"),
              }}
            >
              Hovered menu
            </div>
            <div
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: shown("sb_active_bg"),
                color: shown("sb_active_text"),
              }}
            >
              Active menu
            </div>
          </div>
        </div>
      </fieldset>

      {warnings.length > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          {warnings.join(" ")}
        </p>
      )}

      {canEdit && (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={saving || !dirty || anyInvalid}
            onClick={() =>
              persist(cleanSidebarTheme(theme), "Sidebar colours saved")
            }
          >
            {saving ? "Saving…" : "Save Colors"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving || (!hasAny && !hasSaved)}
            onClick={() =>
              persist(emptySidebarTheme(), "Sidebar colours reset to default")
            }
          >
            Reset to Default
          </Button>
        </div>
      )}
    </div>
  );
}
