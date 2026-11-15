import PageBreadcrumb from "@/components/common/page-breadcrumb";
import InquiryList from "@/components/admin/inquiries/inquiry-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pending Inquiries | Student Admin Panel",
};

export default function InquiriesPendingPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pending Inquiries" />
      <InquiryList title="Pending Inquiries" status="Pending" />
    </div>
  );
}
