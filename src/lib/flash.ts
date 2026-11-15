// One-time message that survives a page change (e.g. after saving a student).
const KEY = "gog_flash";

export function setFlash(message: { type: "success" | "error"; text: string }) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(message));
  } catch {
    /* ignore */
  }
}

export function takeFlash(): {
  type: "success" | "error";
  text: string;
} | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
