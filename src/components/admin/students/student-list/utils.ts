import type { ExportColumn } from "@/lib/export";
import { formatDate } from "@/lib/format";
import type { Student } from "@/types";

export type FeeStatus = "Paid" | "Partial" | "Unpaid";

export function feeStatus(s: Student): FeeStatus {
  const total = Number(s.total_fee) || 0;
  const paid = Number(s.total_paid) || 0;
  if (total > 0 && paid >= total) return "Paid";
  if (total <= 0) return "Paid";
  return paid > 0 ? "Partial" : "Unpaid";
}

export const FEE_STATUS_OPTIONS = [
  { label: "Paid", value: "Paid" },
  { label: "Partial", value: "Partial" },
  { label: "Unpaid", value: "Unpaid" },
];

export function discountText(s: Student) {
  if (!Number(s.discount_value)) return "";
  return s.discount_type === "percentage"
    ? `${Number(s.discount_value)}% off`
    : `₹${Number(s.discount_amount).toLocaleString("en-IN")} off`;
}

const money = (v: number) => Number(v || 0).toFixed(2);

// Columns used for Excel / PDF exports of students.
export const STUDENT_EXPORT_COLUMNS: ExportColumn<Student>[] = [
  { header: "Student ID", value: (r) => r.student_code },
  { header: "Name", value: (r) => r.full_name },
  { header: "Mobile", value: (r) => r.phone || "" },
  { header: "Email", value: (r) => r.email || "" },
  { header: "Course", value: (r) => r.course_name || "" },
  { header: "Duration", value: (r) => r.duration_name || "" },
  {
    header: "Admission Date",
    value: (r) => (r.admission_date ? formatDate(r.admission_date) : ""),
  },
  { header: "Course Fee", value: (r) => money(r.course_fee) },
  { header: "Discount", value: (r) => money(r.discount_amount) },
  { header: "Total Fee", value: (r) => money(r.total_fee) },
  { header: "Paid", value: (r) => money(r.total_paid) },
  { header: "Balance", value: (r) => money(r.balance) },
  { header: "Fee Status", value: (r) => feeStatus(r) },
];
