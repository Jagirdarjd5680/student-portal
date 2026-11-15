import { fileUrl } from "@/lib/config";
import { formatDate } from "@/lib/format";
import type { Admission } from "@/types";

export interface IdCardData {
  type: string;
  number: string;
  name: string;
  father: string;
  gender: string;
  dob: string;
  address: string;
  pin: string;
  photo: string;
  issued: string;
}

/** Hide all but the last 4 letters/digits: "3802 5028 7301" → "XXXX XXXX 7301". */
export function maskId(value: string) {
  const total = (value.match(/[a-z0-9]/gi) || []).length;
  let seen = 0;
  return value.replace(/[a-z0-9]/gi, (ch) => (++seen > total - 4 ? ch : "X"));
}

export function toCardData(a: Admission, reveal: boolean): IdCardData {
  const raw = a.identity_number || "";
  return {
    type: a.identity_proof || "",
    number: raw ? (reveal ? raw : maskId(raw)) : "Not provided",
    name: a.student_name.toUpperCase(),
    father: (a.father_name || "-").toUpperCase(),
    gender: a.gender || "-",
    dob: a.dob ? formatDate(a.dob) : "—",
    address:
      [a.address, [a.city, a.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(", ") || "-",
    pin: a.zip_code || "-",
    photo: fileUrl(a.photo),
    issued: formatDate(a.admission_date),
  };
}
