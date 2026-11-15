"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { FormSkeleton } from "@/components/admin/shared/skeletons";
import { useApi } from "@/hooks/use-api";
import { studentService } from "@/services";
import StudentForm from "./student-form";

export default function StudentEdit({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => studentService.get(id), [id]);

  if (loading) return <FormSkeleton fields={12} />;
  if (error || !data)
    return <FormAlert type="error" message={error || "Student not found"} />;
  return <StudentForm student={data} />;
}
