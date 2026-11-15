import PageBreadcrumb from "@/components/common/page-breadcrumb";
import InquiryList from "@/components/admin/inquiries/inquiry-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Inquiries | Student Admin Panel",
};

export default function InquiriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Inquiries" />
      <InquiryList title="All Inquiries" />
    </div>
  );
}
