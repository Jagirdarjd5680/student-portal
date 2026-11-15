"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { FormSkeleton } from "@/components/admin/shared/skeletons";
import { useApi } from "@/hooks/use-api";
import { inquiryService } from "@/services";
import InquiryForm from "./inquiry-form";

export default function InquiryEdit({ id }: { id: string }) {
  const { data, loading, error } = useApi(() => inquiryService.get(id), [id]);

  if (loading) return <FormSkeleton fields={12} />;
  if (error || !data)
    return <FormAlert type="error" message={error || "Inquiry not found"} />;
  return <InquiryForm inquiry={data} />;
}
