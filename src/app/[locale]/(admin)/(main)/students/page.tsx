import PageBreadcrumb from "@/components/common/page-breadcrumb";
import StudentList from "@/components/admin/students/student-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Students | Student Admin Panel",
};

export default function StudentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Students" />
      <StudentList />
    </div>
  );
}
