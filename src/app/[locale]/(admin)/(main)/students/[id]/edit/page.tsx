import StudentEdit from "@/components/admin/students/student-edit";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Student | Student Admin Panel",
};

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Student" />
      <StudentEdit id={id} />
    </div>
  );
}
