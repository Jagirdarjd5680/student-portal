import type { ExportColumn } from "@/lib/export";
import { formatDate } from "@/lib/format";
import type { Admission } from "@/types";

export const isConfirmed = (r: Admission) => r.status === "Confirmed";

export const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
];

const money = (v: number) => Number(v || 0).toFixed(2);

// Columns used for Excel / PDF exports of admissions.
export const ADMISSION_EXPORT_COLUMNS: ExportColumn<Admission>[] = [
  { header: "Admission No", value: (r) => r.admission_no },
  { header: "Date", value: (r) => formatDate(r.admission_date) },
  { header: "Student Name", value: (r) => r.student_name },
  { header: "Father Name", value: (r) => r.father_name || "" },
  { header: "Mobile", value: (r) => r.phone },
  { header: "Email", value: (r) => r.email || "" },
  { header: "Course", value: (r) => r.course_name || "" },
  { header: "City", value: (r) => r.city || "" },
  { header: "Form Fees", value: (r) => money(r.form_fees) },
  {
    header: "Special Offer",
    value: (r) => (r.special_offer ? r.special_offer_text || "Yes" : ""),
  },
  { header: "Receptionist", value: (r) => r.receptionist_name || "" },
  { header: "Status", value: (r) => r.status },
];
