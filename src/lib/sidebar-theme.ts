// Custom colours for the admin sidebar. Blank = the built-in look (white sidebar).
// The colours are written as one <style> tag, so changing a colour shows live.

export const SIDEBAR_COLOR_KEYS = [
  "sb_bg",
  "sb_text",
  "sb_active_bg",
  "sb_active_text",
  "sb_hover_bg",
  "sb_hover_text",
] as const;

export type SidebarColorKey = (typeof SIDEBAR_COLOR_KEYS)[number];
export type SidebarTheme = Record<SidebarColorKey, string>;

/** What each colour is when nothing is set (the current white sidebar). */
export const SIDEBAR_DEFAULTS: SidebarTheme = {
  sb_bg: "#ffffff",
  sb_text: "#344054",
  sb_active_bg: "#ecf3ff",
  sb_active_text: "#465fff",
  sb_hover_bg: "#f2f4f7",
  sb_hover_text: "#344054",
};

export const emptySidebarTheme = (): SidebarTheme => ({
  sb_bg: "",
  sb_text: "",
  sb_active_bg: "",
  sb_active_text: "",
  sb_hover_bg: "",
  sb_hover_text: "",
});

const HEX = /^#[0-9a-f]{6}$/i;
const STYLE_ID = "admin-sidebar-theme";
const CACHE_KEY = "gog_sidebar_theme";

/** Keep only valid hex colours. */
export function cleanSidebarTheme(
  input: Partial<SidebarTheme> | null | undefined,
) {
  const out = emptySidebarTheme();
  for (const k of SIDEBAR_COLOR_KEYS) {
    const v = String(input?.[k] ?? "").trim();
    out[k] = HEX.test(v) ? v.toLowerCase() : "";
  }
  return out;
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two hex colours (1 to 21). */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * CSS for the colours that are set. Unlayered, so it wins over the Tailwind classes.
 * Every rule starts with `html:not(.dark)`: in dark mode nothing here applies and the
 * default dark look stays.
 */
export function sidebarCss(theme: SidebarTheme) {
  const L = "html:not(.dark)";
  const S = `${L} [data-sidebar="sidebar"]`;
  const T = `${L} header[data-topbar]`;
  const rules: string[] = [];
  const {
    sb_bg,
    sb_text,
    sb_active_bg,
    sb_active_text,
    sb_hover_bg,
    sb_hover_text,
  } = theme;

  if (sb_bg) {
    rules.push(`${S}{background-color:${sb_bg}}`);
    // The logo comes in a black and a white version: pick the one that reads on this colour.
    const dark = luminance(sb_bg) < 0.4;
    rules.push(
      dark
        ? `${S} img[src*="logo-dark"]{display:none}${S} img[src*="logo-lite"]{display:block}`
        : `${S} img[src*="logo-lite"]{display:none}${S} img[src*="logo-dark"]{display:block}`,
    );
  }
  if (sb_text) {
    rules.push(
      `${S}{color:${sb_text}}`,
      `${S} .menu-item-inactive,${S} .menu-dropdown-item-inactive{color:${sb_text}}`,
      `${S} .menu-item-icon-inactive{color:${sb_text}}`,
    );
  }
  if (sb_active_bg || sb_active_text) {
    const bg = sb_active_bg ? `background-color:${sb_active_bg};` : "";
    const fg = sb_active_text ? `color:${sb_active_text};` : "";
    rules.push(
      `${S} .menu-item-active,${S} .menu-dropdown-item-active{${bg}${fg}}`,
    );
    if (sb_active_text) {
      rules.push(
        `${S} .menu-item-icon-active,${S} .menu-item-active svg{color:${sb_active_text}}`,
      );
    }
  }
  if (sb_hover_bg || sb_hover_text) {
    const bg = sb_hover_bg ? `background-color:${sb_hover_bg};` : "";
    const fg = sb_hover_text ? `color:${sb_hover_text};` : "";
    rules.push(
      `${S} .menu-item-inactive:hover,${S} .menu-dropdown-item-inactive:hover{${bg}${fg}}`,
    );
    if (sb_hover_text) {
      rules.push(
        `${S} .menu-item-inactive:hover .menu-item-icon-inactive{color:${sb_hover_text}}`,
      );
    }
  }

  // Top bar always matches the sidebar (the header has data-topbar only in the admin panel).
  if (sb_bg) rules.push(`${T}{background-color:${sb_bg}}`);
  if (sb_text) {
    const soft = "color-mix(in srgb, currentColor 30%, transparent)";
    rules.push(
      `${T},${T} button,${T} a,${T} svg,${T} input,${T} span:not(.rounded-full){color:${sb_text}}`,
      `${T} button{background-color:transparent;border-color:${soft}}`,
      `${T} input::placeholder{color:color-mix(in srgb, currentColor 60%, transparent)}`,
      `${T} [class*="border-gray-"]{border-color:${soft}}`,
    );
  }
  return rules.join("\n");
}

/** Apply a theme to the page right now (null = remove, back to default). */
export function applySidebarTheme(theme: SidebarTheme | null) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID);
  const css = theme ? sidebarCss(theme) : "";
  if (!css) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

/** Last saved theme, kept in the browser so the sidebar has its colours on the first paint. */
export function readCachedSidebarTheme(): SidebarTheme | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? cleanSidebarTheme(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function cacheSidebarTheme(theme: SidebarTheme) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(theme));
  } catch {
    /* ignore */
  }
}

export interface SidebarPreset {
  name: string;
  theme: SidebarTheme;
}

// Order: sidebar bg, text, active bg, active text, hover bg, hover text (the top bar follows bg + text).
const ORDER = [...SIDEBAR_COLOR_KEYS];
const preset = (name: string, colors: string[]): SidebarPreset => ({
  name,
  theme: Object.fromEntries(
    ORDER.map((k, i) => [k, colors[i]]),
  ) as SidebarTheme,
});

/** Ready-made colour sets (sidebar + matching top bar). */
export const SIDEBAR_PRESET_GROUPS: {
  group: string;
  presets: SidebarPreset[];
}[] = [
  {
    group: "Red & Yellow",
    presets: [
      preset("Red + Yellow", [
        "#c40c0c",
        "#ffe9e9",
        "#ffc100",
        "#3b0a0a",
        "#a80a0a",
        "#ffffff",
        "#ffc100",
        "#3b0a0a",
      ]),
      preset("White + Red", [
        "#ffffff",
        "#3a3f4d",
        "#c40c0c",
        "#ffffff",
        "#fde8e8",
        "#c40c0c",
        "#c40c0c",
        "#ffffff",
      ]),
      preset("Dark Red + Gold", [
        "#7a0707",
        "#f6d9d9",
        "#ffc100",
        "#3b0a0a",
        "#960b0b",
        "#ffffff",
        "#ffffff",
        "#7a0707",
      ]),
    ],
  },
  {
    group: "Black",
    presets: [
      preset("Classic Black", [
        "#111111",
        "#cfcfcf",
        "#ffffff",
        "#111111",
        "#262626",
        "#ffffff",
        "#111111",
        "#ffffff",
      ]),
      preset("Black + Red", [
        "#1d1414",
        "#d9cbc8",
        "#c40c0c",
        "#ffffff",
        "#2e2121",
        "#ffffff",
        "#c40c0c",
        "#ffffff",
      ]),
      preset("Black + Yellow", [
        "#141414",
        "#d4d4d4",
        "#ffc100",
        "#141414",
        "#2a2a2a",
        "#ffc100",
        "#ffc100",
        "#141414",
      ]),
    ],
  },
  {
    group: "Blue",
    presets: [
      preset("Royal Blue", [
        "#1e3a8a",
        "#dbe6ff",
        "#ffffff",
        "#1e3a8a",
        "#2a4aa8",
        "#ffffff",
        "#1e3a8a",
        "#ffffff",
      ]),
      preset("Navy + Sky", [
        "#0f172a",
        "#b6c2d9",
        "#38bdf8",
        "#0f172a",
        "#1e293b",
        "#ffffff",
        "#38bdf8",
        "#0f172a",
      ]),
      preset("Light Blue", [
        "#eff6ff",
        "#1e3a5f",
        "#2563eb",
        "#ffffff",
        "#dbeafe",
        "#1d4ed8",
        "#2563eb",
        "#ffffff",
      ]),
    ],
  },
];
