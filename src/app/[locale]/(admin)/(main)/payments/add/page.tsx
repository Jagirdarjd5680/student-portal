import PaymentForm from "@/components/admin/payments/payment-form";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Add Payment | Student Admin Panel",
};

export default function PaymentsAddPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Payment" />
      <Suspense>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
