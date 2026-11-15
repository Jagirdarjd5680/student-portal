import ProfilePage from "@/components/admin/profile";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Student Admin Panel",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <ProfilePage />
    </div>
  );
}
