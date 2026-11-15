import PageBreadcrumb from "@/components/common/page-breadcrumb";
import StudentForm from "@/components/admin/students/student-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Student | Student Admin Panel",
};

export default function StudentsAddPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Student" />
      <StudentForm />
    </div>
  );
}
