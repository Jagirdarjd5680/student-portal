import StudentCertificates from "@/components/student-portal/certificates";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Certificates | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Certificates" />
      <StudentCertificates />
    </div>
  );
}
