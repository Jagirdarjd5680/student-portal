import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Categories from "@/components/admin/categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | Student Admin Panel",
};

export default function CategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />
      <Categories />
    </div>
  );
}
