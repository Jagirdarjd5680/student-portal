"use client";

import { useApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";
import { studentService } from "@/services";
import type { Option } from "@/types";
import { useMemo } from "react";

// Student dropdown: "Name (ID) - Course - Balance ₹x"
export function useStudentOptions() {
  const { data, reload } = useApi(() => studentService.list());
  const students = useMemo(() => data || [], [data]);
  const options: Option[] = useMemo(
    () =>
      students.map((s) => ({
        value: String(s.id),
        label: `${s.full_name} (${s.student_code}) - ${s.course_name || "No course"} - Balance ${formatCurrency(s.balance)}`,
      })),
    [students],
  );
  return { students, options, reload };
}
