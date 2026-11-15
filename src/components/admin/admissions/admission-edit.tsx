"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { FormSkeleton } from "@/components/admin/shared/skeletons";
import { useApi } from "@/hooks/use-api";
import { admissionService } from "@/services";
import AdmissionForm from "./admission-form";

export default function AdmissionEdit({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => admissionService.get(id), [id]);

  if (loading) return <FormSkeleton fields={18} />;
  if (error || !data)
    return <FormAlert type="error" message={error || "Admission not found"} />;
  return <AdmissionForm admission={data} />;
}
