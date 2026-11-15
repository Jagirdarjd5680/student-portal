import RolesPage from "@/components/admin/roles";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions | Student Admin Panel",
};

export default function RolesRoute() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Roles & Permissions" />
      <RolesPage />
    </div>
  );
}
