// Single inquiry → PDF, laid out like the approved "Inquiry Form" design.
import { INQUIRY_PDF_THEME as T, INSTITUTE_NAME } from "@/data/institute";
import {
  detailRows,
  footerBand,
  headerBand,
  loadLogo,
  longDate,
  MARGIN,
  newPdf,
  sectionPill,
  signature,
  type DetailRow,
} from "@/lib/pdf";
import type { InstituteInfo, Inquiry } from "@/types";

export async function buildInquiryPdf(
  row: Inquiry,
  institute?: InstituteInfo | null,
) {
  const [doc, logo] = await Promise.all([newPdf(), loadLogo()]);
  const name = institute?.name || INSTITUTE_NAME;

  let y = headerBand(
    doc,
    logo,
    name.toUpperCase(),
    [`Inquiry No: ${row.inquiry_no}`, "Inquiry Form"],
    36,
    T,
  );

  y = sectionPill(doc, "INQUIRY DETAILS", MARGIN, y + 5.5, T) + 2;
  y = detailRows(
    doc,
    [
      ["Date of Inquiry", longDate(row.inquiry_date)],
      ["Course Interested", row.course_name || "-", true],
      ["Source of Inquiry", row.source || "-"],
      ["Receptionist", row.receptionist_name || "-"],
    ],
    y,
    T,
  );

  y = sectionPill(doc, "STUDENT INFORMATION", MARGIN, y + 8.5, T) + 2;
  const place = [row.city, row.state].filter(Boolean).join(", ");
  const studentRows: DetailRow[] = [
    ["Full Name", row.student_name],
    ["Gender", row.gender || "-"],
    ["Phone Number", row.phone],
  ];
  if (row.email) studentRows.push(["Email", row.email]);
  studentRows.push([
    "Address",
    [row.address, place].filter(Boolean).join("\n") || "-",
  ]);
  y = detailRows(doc, studentRows, y, T);

  signature(doc, name, y, T);
  footerBand(doc, name, T);
  return { doc, fileName: `Inquiry-${row.inquiry_no}.pdf` };
}

export async function downloadInquiryPdf(
  row: Inquiry,
  institute?: InstituteInfo | null,
) {
  const { doc, fileName } = await buildInquiryPdf(row, institute);
  doc.save(fileName);
}
