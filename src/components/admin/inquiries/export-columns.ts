import type { ExportColumn } from "@/lib/export";
import { formatDate } from "@/lib/format";
import type { Inquiry } from "@/types";
import { statusLabel } from "./inquiry-list/utils";

// Columns used for Excel / PDF exports of inquiries.
export const INQUIRY_EXPORT_COLUMNS: ExportColumn<Inquiry>[] = [
  { header: "Form No", value: (r) => r.inquiry_no },
  { header: "Date", value: (r) => formatDate(r.inquiry_date) },
  { header: "Student Name", value: (r) => r.student_name },
  { header: "Gender", value: (r) => r.gender || "" },
  { header: "Mobile", value: (r) => r.phone },
  { header: "Email", value: (r) => r.email || "" },
  { header: "Course", value: (r) => r.course_name || "" },
  { header: "City", value: (r) => r.city || "" },
  { header: "State", value: (r) => r.state || "" },
  { header: "Source", value: (r) => r.source || "" },
  { header: "Receptionist", value: (r) => r.receptionist_name || "" },
  { header: "Status", value: (r) => statusLabel(r) },
];
