import PageBreadcrumb from "@/components/common/page-breadcrumb";
import InquiryForm from "@/components/admin/inquiries/inquiry-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Inquiry | Student Admin Panel",
};

export default function InquiriesAddPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Inquiry" />
      <InquiryForm />
    </div>
  );
}
