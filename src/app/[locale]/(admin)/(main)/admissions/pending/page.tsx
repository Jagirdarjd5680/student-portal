import PageBreadcrumb from "@/components/common/page-breadcrumb";
import AdmissionList from "@/components/admin/admissions/admission-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pending Admissions | Student Admin Panel",
};

export default function AdmissionsPendingPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pending Admissions" />
      <AdmissionList title="Pending Admissions" status="Pending" />
    </div>
  );
}
