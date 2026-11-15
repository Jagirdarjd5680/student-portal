import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Refunds from "@/components/admin/refunds";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds | Student Admin Panel",
};

export default function RefundsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Refunds" />
      <Refunds />
    </div>
  );
}
