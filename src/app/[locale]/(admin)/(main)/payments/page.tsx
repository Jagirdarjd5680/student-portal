import PageBreadcrumb from "@/components/common/page-breadcrumb";
import PaymentList from "@/components/admin/payments/payment-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments | Student Admin Panel",
};

export default function PaymentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments" />
      <PaymentList />
    </div>
  );
}
