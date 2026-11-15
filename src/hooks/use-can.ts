"use client";

import type { PermissionAction, PermissionModule } from "@/data/permissions";
import { can, getAdminRaw, subscribeAdmin, type AdminUser } from "@/lib/auth";
import { useCallback, useMemo, useSyncExternalStore } from "react";

/** The signed-in admin / staff user (kept fresh by the permission gate). */
export function useAdmin(): AdminUser | null {
  const raw = useSyncExternalStore(subscribeAdmin, getAdminRaw, () => null);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  }, [raw]);
}

/** `can("students", "edit")` — use it to show or hide a button. */
export function useCan() {
  const admin = useAdmin();
  return useCallback(
    (module: PermissionModule, action: PermissionAction = "view") =>
      can(admin, module, action),
    [admin],
  );
}
