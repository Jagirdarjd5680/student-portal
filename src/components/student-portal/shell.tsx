"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { ProfilePageSkeleton } from "@/components/admin/shared/skeletons";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "@/i18n/navigation";
import AppHeader from "@/layout/app-layout/header";
import AppSidebar from "@/layout/app-layout/sidebar";
import { useEffect, useMemo } from "react";
import { StudentProvider, useStudent } from "./context";
import { menuForPath, studentNav } from "./nav";

// Same shell as the admin panel (sidebar + header), with the student menu.
// A URL for a menu the student has no access to is sent back to the dashboard.
function Gate({ children }: { children: React.ReactNode }) {
  const { me, loading, error } = useStudent();
  const pathname = usePathname();
  const router = useRouter();

  const required = menuForPath(pathname);
  const allowed = !required || Boolean(me?.menus.includes(required));

  useEffect(() => {
    if (me && !allowed) router.replace("/student/dashboard");
  }, [me, allowed, router]);

  const items = useMemo(
    () =>
      studentNav.filter(
        (n) => !n.portalMenu || me?.menus.includes(n.portalMenu),
      ),
    [me],
  );

  if (!me) {
    return (
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
        {loading ? (
          <ProfilePageSkeleton />
        ) : (
          <FormAlert
            inline
            type="error"
            message={error || "Could not load your account"}
          />
        )}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        items={items}
        portal={{
          title: "Student Portal",
          subtitle: `Welcome, ${me.student.full_name}`,
          href: "/student/dashboard",
        }}
      />
      <SidebarInset>
        <AppHeader portal="student" />
        <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
          {allowed ? children : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentProvider>
      <Gate>{children}</Gate>
    </StudentProvider>
  );
}
