import type { Option } from "@/types";

const toOptions = (values: string[]): Option[] =>
  values.map((v) => ({ label: v, value: v }));

export const GENDER_OPTIONS = toOptions(["Male", "Female", "Other"]);

export const INQUIRY_SOURCE_OPTIONS = toOptions([
  "Google",
  "Youtube",
  "Facebook",
  "Instagram",
  "Friend/Referral",
  "Other",
]);

export const ID_PROOF_OPTIONS = toOptions([
  "Aadhar Card",
  "PAN Card",
  "Driving License",
  "Voter ID",
  "Passport",
]);

export const PAYMENT_METHOD_OPTIONS = toOptions([
  "UPI",
  "Net Banking",
  "Card",
  "Cash",
  "Other",
]);

export const MATERIAL_TYPE_OPTIONS = toOptions([
  "PDF Document",
  "Image",
  "Text Content",
]);

export const DISCOUNT_TYPE_OPTIONS: Option[] = [
  { label: "Fixed Amount", value: "fixed" },
  { label: "Percentage (%)", value: "percentage" },
];

export const PAGE_SIZE_OPTIONS = toOptions(["10", "25", "50", "100"]);

export const MATERIAL_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx";
export const MAX_PHOTO_MB = 10;
export const MAX_FILE_MB = 20; // study materials, certificates (backend MAX_FILE_MB)
