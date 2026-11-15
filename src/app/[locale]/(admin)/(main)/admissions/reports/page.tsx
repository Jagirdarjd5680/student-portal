import PageBreadcrumb from "@/components/common/page-breadcrumb";
import AdmissionReports from "@/components/admin/admissions/admission-reports";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admission Reports | Student Admin Panel",
};

export default function AdmissionsReportsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Admission Reports" />
      <AdmissionReports />
    </div>
  );
}
