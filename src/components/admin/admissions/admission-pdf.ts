// Single admission → PDF, laid out like the approved "Admission Form" design
// (white header, yellow rule, navy section labels, navy footer).
import { ADMISSION_PDF_THEME as T, INSTITUTE_NAME } from "@/data/institute";
import { fileUrl } from "@/lib/config";
import {
  detailRows,
  footerBand,
  headerBand,
  highlightBox,
  loadImage,
  loadLogo,
  longDate,
  MARGIN,
  newPdf,
  sectionPill,
  signature,
  type DetailRow,
} from "@/lib/pdf";
import type { Admission, InstituteInfo } from "@/types";

const rupees = (v: number) =>
  `Rs. ${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function buildAdmissionPdf(
  row: Admission,
  institute?: InstituteInfo | null,
) {
  const [doc, logo, photo] = await Promise.all([
    newPdf(),
    loadLogo(),
    row.photo ? loadImage(fileUrl(row.photo)) : Promise.resolve(null),
  ]);
  const name = institute?.name || INSTITUTE_NAME;

  let y = headerBand(
    doc,
    logo,
    name.toUpperCase(),
    [`Admission No: ${row.admission_no}`, "Admission Form"],
    36,
    T,
  );

  // Admission details (form fees only when charged).
  const admissionRows: DetailRow[] = [
    ["Date of Admission", longDate(row.admission_date)],
    ["Course Enrolled", row.course_name || "-", true],
  ];
  if (Number(row.form_fees) > 0)
    admissionRows.push(["Admission Form Fees", rupees(row.form_fees), true]);
  admissionRows.push(["Receptionist", row.receptionist_name || "-"]);

  y = sectionPill(doc, "ADMISSION DETAILS", MARGIN, y + 6, T) + 2;
  y = detailRows(doc, admissionRows, y, T);

  if (row.special_offer && row.special_offer_text) {
    y = highlightBox(doc, "Special Offer", row.special_offer_text, y + 4, T);
  }

  // Student information (photo first when uploaded).
  const studentRows: DetailRow[] = [];
  if (photo) studentRows.push({ label: "Student Photo", image: photo });
  studentRows.push(
    ["Full Name", row.student_name.toUpperCase()],
    ["Father's Name", (row.father_name || "-").toUpperCase()],
    ["Gender", row.gender || "-"],
    ["Phone Number", row.phone],
    ["Email Address", row.email || "-"],
    [
      "Address",
      [
        row.address,
        [row.city, row.state].filter(Boolean).join(", "),
        row.zip_code,
      ]
        .filter(Boolean)
        .join("\n") || "-",
    ],
  );
  y = sectionPill(doc, "STUDENT INFORMATION", MARGIN, y + 7, T) + 2;
  y = detailRows(doc, studentRows, y, T);

  // Identity proof (type → number).
  if (row.identity_proof || row.identity_number) {
    y = sectionPill(doc, "IDENTITY PROOF", MARGIN, y + 7, T) + 2;
    y = detailRows(
      doc,
      [[row.identity_proof || "Identity Proof", row.identity_number || "-"]],
      y,
      T,
    );
  }

  signature(doc, name, y, T);
  footerBand(doc, name, T);
  return { doc, fileName: `Admission-${row.admission_no}.pdf` };
}

export async function downloadAdmissionPdf(
  row: Admission,
  institute?: InstituteInfo | null,
) {
  const { doc, fileName } = await buildAdmissionPdf(row, institute);
  doc.save(fileName);
}
