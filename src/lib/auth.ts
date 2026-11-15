import type {
  PermissionAction,
  PermissionModule,
  Permissions,
} from "@/data/permissions";
import { AUTH_COOKIE, STUDENT_COOKIE } from "./config";

const ADMIN_KEY = "gog_admin";
// Cookies are only sent over HTTPS when the site is served over HTTPS.
const SECURE =
  typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  role_name?: string | null;
  /** "receptionist" users are auto-filled as the receptionist on what they add. */
  category?: "receptionist" | "other";
  /** "own" = sees only the records this user added. */
  data_scope?: "all" | "own";
  /** Id of the linked receptionist record (receptionists table). */
  receptionist_id?: number | null;
  /** Super admins have every permission. Older sessions (no flag) are treated as super. */
  is_super?: boolean;
  permissions?: Permissions;
}

/** Can this user do `action` on `module`? */
export function can(
  user: AdminUser | null | undefined,
  module: PermissionModule,
  action: PermissionAction = "view",
) {
  if (!user) return false;
  if (user.is_super !== false) return true;
  return Boolean(user.permissions?.[module]?.includes(action));
}

/** Replace the stored profile (e.g. after /auth/me returns fresh permissions). */
export function updateStoredAdmin(admin: AdminUser) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    window.dispatchEvent(new Event(ADMIN_EVENT));
  } catch {
    /* ignore */
  }
}

const ADMIN_EVENT = "gog-admin-change";

/** Subscribe to profile changes (for useSyncExternalStore). */
export function subscribeAdmin(cb: () => void) {
  window.addEventListener(ADMIN_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ADMIN_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/** Replace only the token (after the user changes their password). */
export function saveToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${SECURE}`;
}

export function saveSession(token: string, admin: AdminUser) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${SECURE}`;
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch {
    /* ignore */
  }
}

// Raw stored value (stable string, usable with useSyncExternalStore).
export function getAdminRaw(): string | null {
  try {
    return localStorage.getItem(ADMIN_KEY);
  } catch {
    return null;
  }
}

export function getAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

// ── Student portal session (separate cookie + profile from the admin one) ──
const STUDENT_KEY = "gog_student";
const STUDENT_EVENT = "gog-student-change";

export interface StudentUser {
  id: number;
  name: string;
  student_code: string;
  /** Allowed portal menus, always including "dashboard". */
  menus: string[];
}

export function getStudentToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${STUDENT_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function saveStudentSession(token: string, student: StudentUser) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${STUDENT_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${SECURE}`;
  updateStoredStudent(student);
}

/** Replace only the token (after the student changes their password). */
export function saveStudentToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${STUDENT_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${SECURE}`;
}

export function updateStoredStudent(student: StudentUser) {
  try {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    window.dispatchEvent(new Event(STUDENT_EVENT));
  } catch {
    /* ignore */
  }
}

export function getStudentRaw(): string | null {
  try {
    return localStorage.getItem(STUDENT_KEY);
  } catch {
    return null;
  }
}

export function subscribeStudent(cb: () => void) {
  window.addEventListener(STUDENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(STUDENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function clearStudentSession() {
  document.cookie = `${STUDENT_COOKIE}=; path=/; max-age=0`;
  try {
    localStorage.removeItem(STUDENT_KEY);
  } catch {
    /* ignore */
  }
}
