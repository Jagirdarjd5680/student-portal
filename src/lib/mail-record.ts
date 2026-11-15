// Automatic email after a new inquiry / admission / student: the PDFs are built in the
// browser (same design as the downloads) and the server mails them to the email saved
// on the record. Returns a short note to show to the user, or null when nothing to say.
import { buildAdmissionPdf } from "@/components/admin/admissions/admission-pdf";
import { buildInquiryPdf } from "@/components/admin/inquiries/inquiry-pdf";
import {
  admissionService,
  inquiryService,
  mailService,
  type MailResult,
} from "@/services";
import type { InstituteInfo } from "@/types";
import type { jsPDF } from "jspdf";

export interface MailNote {
  ok: boolean;
  text: string;
}

const attachment = (doc: jsPDF, name: string) => ({
  name,
  // "data:application/pdf;...;base64,XXXX" -> XXXX
  data: doc.output("datauristring").split("base64,")[1] || "",
});

function describe(r: MailResult): MailNote | null {
  switch (r.status) {
    case "sent":
      return { ok: true, text: `Email with PDF sent to ${r.to}.` };
    case "smtp_missing":
      return {
        ok: false,
        text: "Email not sent: SMTP is not set up yet (Settings → Email).",
      };
    case "failed":
      return {
        ok: false,
        text: `Email not sent: ${r.message || "unknown error"}`,
      };
    default:
      return null; // no email on the record, or automatic email switched off
  }
}

async function run(fn: () => Promise<MailResult>): Promise<MailNote | null> {
  try {
    return describe(await fn());
  } catch (err) {
    return {
      ok: false,
      text: `Email not sent: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }
}

export function emailNewInquiry(id: number) {
  return run(async () => {
    const [row, institute] = await Promise.all([
      inquiryService.get(id),
      inquiryService.institute(),
    ]);
    const { doc, fileName } = await buildInquiryPdf(row, institute);
    return mailService.sendRecord({
      kind: "inquiry",
      id,
      pdfs: [attachment(doc, fileName)],
    });
  });
}

export function emailNewAdmission(id: number) {
  return run(async () => {
    const [row, institute] = await Promise.all([
      admissionService.get(id),
      inquiryService.institute(),
    ]);
    const { doc, fileName } = await buildAdmissionPdf(row, institute);
    return mailService.sendRecord({
      kind: "admission",
      id,
      pdfs: [attachment(doc, fileName)],
    });
  });
}

/** New student: welcome mail with the admission PDF and (if it came from one) the inquiry PDF. */
export function emailNewStudent(id: number, admissionId?: number | null) {
  return run(async () => {
    const pdfs: { name: string; data: string }[] = [];
    if (admissionId) {
      const institute: InstituteInfo = await inquiryService.institute();
      const adm = await admissionService.get(admissionId);
      const a = await buildAdmissionPdf(adm, institute);
      pdfs.push(attachment(a.doc, a.fileName));
      if (adm.inquiry_id) {
        const inq = await inquiryService.get(adm.inquiry_id);
        const i = await buildInquiryPdf(inq, institute);
        pdfs.push(attachment(i.doc, i.fileName));
      }
    }
    return mailService.sendRecord({ kind: "student", id, pdfs });
  });
}
