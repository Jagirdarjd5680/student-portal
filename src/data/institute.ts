// Branding used on generated PDFs. The backend INSTITUTE_* env values
// (name / address / phone) override the name when set.
export const INSTITUTE_LOGO = "/images/logo/logo.png";
export const INSTITUTE_NAME = "God of Graphics";

export interface PdfTheme {
  headerBg: string; // header band
  rule: string; // line under the header
  title: string; // institute name in the header
  pill: string; // section label background
  pillAccent?: string; // small bar on the left of each section label
  footerBg: string;
  footerText: string;
  text: string;
  muted: string;
  labelBg: string;
  border: string;
  highlightBg: string; // e.g. "Special Offer" box
}

const common = {
  text: "#333333",
  muted: "#777777",
  labelBg: "#F6F7F9",
  border: "#E6E6E6",
};

// Inquiry form: pink header (approved design).
export const INQUIRY_PDF_THEME: PdfTheme = {
  ...common,
  headerBg: "#FCE4EC",
  rule: "#E91E63",
  title: "#E91E63",
  pill: "#3D3D3D",
  footerBg: "#3D3D3D",
  footerText: "#E5E7EB",
  highlightBg: "#FCE4EC",
};

// Admission form: white header, navy + yellow (approved design).
export const ADMISSION_PDF_THEME: PdfTheme = {
  ...common,
  headerBg: "#FFFFFF",
  rule: "#F5C400",
  title: "#111111",
  pill: "#0B2341",
  pillAccent: "#F5C400",
  footerBg: "#0B2341",
  footerText: "#F5C400",
  highlightBg: "#FFF6DA",
};
