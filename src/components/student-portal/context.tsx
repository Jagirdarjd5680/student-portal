"use client";

import { useApi } from "@/hooks/use-api";
import { updateStoredStudent } from "@/lib/auth";
import { studentPortalService } from "@/services";
import type { PortalMe } from "@/types";
import { createContext, useContext, useEffect } from "react";

interface StudentContextValue {
  me: PortalMe | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

// One /student/me request shared by the sidebar, header, guard and pages.
export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error, reload } = useApi(() =>
    studentPortalService.me(),
  );

  // Keep the stored profile (header name, menus) in sync with the server.
  useEffect(() => {
    if (data) {
      updateStoredStudent({
        id: data.student.id,
        name: data.student.full_name,
        student_code: data.student.student_code,
        menus: data.menus,
      });
    }
  }, [data]);

  return (
    <StudentContext.Provider value={{ me: data, loading, error, reload }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used inside <StudentProvider>");
  return ctx;
}
