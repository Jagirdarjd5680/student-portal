import StudentPayments from "@/components/student-portal/payments";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment History | Student Portal",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payment History" />
      <StudentPayments />
    </div>
  );
}
