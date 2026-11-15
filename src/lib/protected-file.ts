import { fetchBlob } from "./api-client";

/**
 * Open (in a new tab) or download a protected file. The tab is opened first, inside
 * the click, so the browser's pop-up blocker lets it through.
 */
export async function openProtectedFile(
  path: string,
  opts: { download?: boolean; name?: string } = {},
) {
  const win = opts.download ? null : window.open("", "_blank");
  try {
    const blob = await fetchBlob(
      path,
      opts.download ? { download: 1 } : undefined,
    );
    const url = URL.createObjectURL(blob);
    if (opts.download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = opts.name || "file";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else if (win) {
      win.location.href = url;
    }
  } catch (err) {
    win?.close();
    throw err;
  }
}
