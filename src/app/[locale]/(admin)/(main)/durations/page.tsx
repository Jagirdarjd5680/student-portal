import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Durations from "@/components/admin/durations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Durations | Student Admin Panel",
};

export default function DurationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Durations" />
      <Durations />
    </div>
  );
}
