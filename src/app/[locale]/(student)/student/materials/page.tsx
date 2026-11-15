import StudentMaterials from "@/components/student-portal/materials";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Materials | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Study Materials" />
      <StudentMaterials />
    </div>
  );
}
