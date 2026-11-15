import PageBreadcrumb from "@/components/common/page-breadcrumb";
import AdmissionList from "@/components/admin/admissions/admission-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Admissions | Student Admin Panel",
};

export default function AdmissionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Admissions" />
      <AdmissionList title="All Admissions" />
    </div>
  );
}
