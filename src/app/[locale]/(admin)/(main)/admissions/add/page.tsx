import PageBreadcrumb from "@/components/common/page-breadcrumb";
import AdmissionForm from "@/components/admin/admissions/admission-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Admission | Student Admin Panel",
};

export default function AdmissionsAddPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Admission" />
      <AdmissionForm />
    </div>
  );
}
