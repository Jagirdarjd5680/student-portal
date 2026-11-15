import Certificates from "@/components/admin/certificates";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates | Student Admin Panel",
};

export default function CertificatesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Certificates" />
      <Certificates />
    </div>
  );
}
