import PageBreadcrumb from "@/components/common/page-breadcrumb";
import InquiryReports from "@/components/admin/inquiries/inquiry-reports";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquiry Reports | Student Admin Panel",
};

export default function InquiriesReportsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Inquiry Reports" />
      <InquiryReports />
    </div>
  );
}
