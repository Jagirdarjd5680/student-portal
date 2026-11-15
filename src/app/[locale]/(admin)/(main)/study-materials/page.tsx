import PageBreadcrumb from "@/components/common/page-breadcrumb";
import StudyMaterials from "@/components/admin/study-materials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Materials | Student Admin Panel",
};

export default function StudyMaterialsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Study Materials" />
      <StudyMaterials />
    </div>
  );
}
