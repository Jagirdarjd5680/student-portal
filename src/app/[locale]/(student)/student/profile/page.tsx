import StudentProfile from "@/components/student-portal/profile";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <StudentProfile />
    </div>
  );
}
