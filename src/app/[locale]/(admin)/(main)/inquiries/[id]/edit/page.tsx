import InquiryEdit from "@/components/admin/inquiries/inquiry-edit";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Inquiry | Student Admin Panel",
};

export default async function InquiryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Inquiry" />
      <InquiryEdit id={id} />
    </div>
  );
}
