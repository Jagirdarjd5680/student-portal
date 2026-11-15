"use client";

import { Spinner } from "@/components/ui/spinner";
import { clearSession, clearStudentSession } from "@/lib/auth";
import { useEffect } from "react";

export default function Logout({ portal }: { portal?: "student" } = {}) {
  useEffect(() => {
    if (portal === "student") {
      clearStudentSession();
      window.location.replace("/signin");
    } else {
      clearSession();
      window.location.replace("/signin");
    }
  }, [portal]);

  return (
    <div className="flex min-h-60 items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
      <Spinner className="size-5" /> Logging out...
    </div>
  );
}
