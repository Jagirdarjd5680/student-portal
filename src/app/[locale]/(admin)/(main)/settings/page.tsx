import SettingsPage from "@/components/admin/settings";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Student Admin Panel",
};

export default function SettingsRoute() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      <SettingsPage />
    </div>
  );
}
