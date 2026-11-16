import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import type { AdminUser } from "./lib/auth";
import { permissionFor, studentMenuFor } from "./lib/route-access";

const intlMiddleware = createMiddleware(routing);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE || "gog_admin_token";
const STUDENT_COOKIE =
  process.env.NEXT_PUBLIC_STUDENT_COOKIE || "gog_student_token";
const PUBLIC_PATHS = ["/signin", "/forgot-password"];

type Check<T> =
  | { status: "ok"; data: T }
  | { status: "invalid" } // token rejected by the API
  | { status: "down" }; // API unreachable: fail closed, keep the session

// Every protected page is verified against the API on the server, so a forged
// or stale cookie, a removed permission or a deleted user never reaches a page.
// A successful check is remembered for a few seconds so clicking around does not
// call the API on every single page navigation (this was the main source of lag).
const CACHE_MS = 10_000;
const okCache = new Map<string, { at: number; data: unknown }>();

async function verify<T>(
  path: string,
  token: string,
  retry = true,
): Promise<Check<T>> {
  const key = `${path}|${token}`;
  const hit = okCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return { status: "ok", data: hit.data as T };
  }
  const result = await verifyFresh<T>(path, token, retry);
  if (result.status === "ok") {
    if (okCache.size > 500) okCache.clear();
    okCache.set(key, { at: Date.now(), data: result.data });
  } else {
    okCache.delete(key);
  }
  return result;
}

async function verifyFresh<T>(
  path: string,
  token: string,
  retry: boolean,
): Promise<Check<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) return { status: "invalid" };
    if (!res.ok) throw new Error(String(res.status));
    return { status: "ok", data: (await res.json()) as T };
  } catch {
    // One quick retry: the API may just be restarting.
    if (retry) {
      await new Promise((r) => setTimeout(r, 500));
      return verifyFresh<T>(path, token, false);
    }
    return { status: "down" };
  }
}

const can = (admin: AdminUser, module: string, action: string) =>
  admin.is_super === true ||
  Boolean(
    (admin.permissions as Record<string, string[]> | undefined)?.[
      module
    ]?.includes(action),
  );

// One login page (/signin) for everyone.
//  - Admin pages: valid admin/staff login + the permission for that URL
//    (super admin only for anything not in the permission list).
//  - /student pages: valid student login + the portal menu for that URL.
//  - Everything else redirects to /signin.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get(AUTH_COOKIE)?.value;
  const studentToken = request.cookies.get(STUDENT_COOKIE)?.value;

  const go = (path: string, clear?: string) => {
    // Behind a reverse proxy request.url holds the internal host (localhost:PORT),
    // so build the redirect from the public host the visitor actually used.
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
      request.headers.get("host") ||
      request.nextUrl.host;
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      request.nextUrl.protocol.replace(":", "");
    const res = NextResponse.redirect(new URL(path, `${proto}://${host}`));
    if (clear) res.cookies.delete(clear);
    return res;
  };
  const unavailable = () =>
    new NextResponse("Service temporarily unavailable", { status: 503 });

  const isStudentArea = pathname === "/student" || pathname.startsWith("/student/");
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // ── Student portal ──
  if (isStudentArea) {
    if (pathname === "/student/login" || !studentToken) return go("/signin");
    const r = await verify<{ menus: string[] }>("/student/access", studentToken);
    if (r.status === "down") return unavailable();
    if (r.status === "invalid") return go("/signin", STUDENT_COOKIE);

    const need = studentMenuFor(pathname);
    if (need === "deny" || (need && !r.data.menus.includes(need))) {
      return go("/student/dashboard");
    }
    return intlMiddleware(request);
  }

  // ── Login page: only for signed-out visitors ──
  if (isPublic) {
    if (adminToken) {
      const r = await verify("/auth/me", adminToken);
      if (r.status === "ok") return go("/");
      if (r.status === "down") return unavailable();
      // invalid: fall through and show the login page (cookie cleared below)
      const res = intlMiddleware(request);
      res.cookies.delete(AUTH_COOKIE);
      return res;
    }
    if (studentToken) {
      const r = await verify("/student/access", studentToken);
      if (r.status === "ok") return go("/student/dashboard");
      if (r.status === "down") return unavailable();
      const res = intlMiddleware(request);
      res.cookies.delete(STUDENT_COOKIE);
      return res;
    }
    return intlMiddleware(request);
  }

  // ── Admin / staff pages (everything else) ──
  if (!adminToken) return go(studentToken ? "/student/dashboard" : "/signin");
  const r = await verify<{ admin: AdminUser }>("/auth/me", adminToken);
  if (r.status === "down") return unavailable();
  if (r.status === "invalid") return go("/signin", AUTH_COOKIE);

  const admin = r.data.admin;
  const need = permissionFor(pathname);
  const allowed =
    need === null
      ? true
      : need === "deny"
        ? admin.is_super === true
        : can(admin, need.module, need.action);
  if (!allowed) return go("/");

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
};
