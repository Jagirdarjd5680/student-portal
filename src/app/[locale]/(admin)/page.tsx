import Dashboard from "@/components/admin/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Student Admin Panel",
};

export default function DashboardPage() {
  return <Dashboard />;
}
