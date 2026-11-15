import StudentCourse from "@/components/student-portal/course";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Course | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Course" />
      <StudentCourse />
    </div>
  );
}
