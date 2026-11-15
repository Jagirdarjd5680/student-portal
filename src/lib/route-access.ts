// Pure route → permission rules, shared by the server proxy (real enforcement)
// and the client PermissionGate (UX only). No browser or React imports here.
import type { PermissionAction, PermissionModule } from "@/data/permissions";

// First URL segment → permission module.
export const MODULE_BY_SEGMENT: Record<string, PermissionModule> = {
  inquiries: "inquiries",
  admissions: "admissions",
  students: "students",
  courses: "courses",
  categories: "categories",
  durations: "durations",
  "study-materials": "study_materials",
  payments: "payments",
  refunds: "refunds",
  reports: "reports",
  roles: "roles",
  settings: "settings",
  certificates: "certificates",
};

// Open for every signed-in admin / staff user.
const ALWAYS_OPEN = new Set(["", "profile", "logout"]);

export type Need =
  { module: PermissionModule; action: PermissionAction } | "deny" | null;

/**
 * What an admin URL needs: ".../add" → add, ".../edit" → edit, otherwise view.
 * "deny" = super admin only (template demo pages, unknown URLs).
 */
export function permissionFor(pathname: string): Need {
  const segs = pathname.split("/").filter(Boolean);
  const first = segs[0] ?? "";
  if (ALWAYS_OPEN.has(first)) return null;
  const mod = MODULE_BY_SEGMENT[first];
  if (!mod) return "deny";
  const last = segs[segs.length - 1];
  return {
    module: mod,
    action: last === "add" ? "add" : last === "edit" ? "edit" : "view",
  };
}

// Student portal: second URL segment → portal menu. Dashboard / logout need none.
const STUDENT_MENU_BY_SEGMENT: Record<string, string> = {
  course: "course",
  materials: "materials",
  profile: "profile",
  payments: "payments",
  certificates: "certificates",
};
const STUDENT_OPEN = new Set(["", "dashboard", "logout"]);

/**
 * Menu a "/student/..." URL needs. `null` = open to any logged-in student,
 * "deny" = unknown student URL (nobody gets it).
 */
export function studentMenuFor(pathname: string): string | null | "deny" {
  const seg = pathname.split("/").filter(Boolean)[1] ?? "";
  if (STUDENT_OPEN.has(seg)) return null;
  return STUDENT_MENU_BY_SEGMENT[seg] ?? "deny";
}
