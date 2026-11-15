import StudentDashboard from "@/components/student-portal/dashboard";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      <StudentDashboard />
    </div>
  );
}
