import AdmissionEdit from "@/components/admin/admissions/admission-edit";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Admission | Student Admin Panel",
};

export default async function AdmissionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Admission" />
      <AdmissionEdit id={id} />
    </div>
  );
}
