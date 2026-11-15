import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Reports from "@/components/admin/reports";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | Student Admin Panel",
};

export default function ReportsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Reports" />
      <Reports />
    </div>
  );
}
