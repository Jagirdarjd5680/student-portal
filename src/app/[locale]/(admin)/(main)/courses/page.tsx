import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Courses from "@/components/admin/courses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | Student Admin Panel",
};

export default function CoursesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Courses" />
      <Courses />
    </div>
  );
}
