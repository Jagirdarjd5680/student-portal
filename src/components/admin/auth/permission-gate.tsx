"use client";

import { useAdmin } from "@/hooks/use-can";
import { usePathname, useRouter } from "@/i18n/navigation";
import { can, updateStoredAdmin } from "@/lib/auth";
import { permissionFor } from "@/lib/route-access";
import { authService } from "@/services";
import { useEffect, useState } from "react";

// Wraps every admin page. The real check runs server-side in proxy.ts; this is
// only the client-side fallback (also keeps stored permissions fresh).
export default function PermissionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [fresh, setFresh] = useState(false);

  // Always re-read the permissions from the server once per page load.
  useEffect(() => {
    authService
      .me()
      .then((r) => updateStoredAdmin(r.admin))
      .catch(() => {})
      .finally(() => setFresh(true));
  }, []);

  const isSuper = admin ? admin.is_super !== false : false;
  const ready = fresh || isSuper;
  const need = permissionFor(pathname);
  const allowed =
    need === null
      ? true
      : need === "deny"
        ? isSuper
        : can(admin, need.module, need.action);

  useEffect(() => {
    if (ready && !allowed) router.replace("/");
  }, [ready, allowed, router]);

  return ready && allowed ? <>{children}</> : null;
}
