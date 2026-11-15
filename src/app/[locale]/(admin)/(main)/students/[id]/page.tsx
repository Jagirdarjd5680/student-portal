import StudentView from "@/components/admin/students/student-view";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Details | Student Admin Panel",
};

export default async function StudentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Student Details" />
      <StudentView id={id} />
    </div>
  );
}
