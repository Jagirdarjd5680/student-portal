import type { Inquiry } from "@/types";

// The DB stores "Contacted"; the UI calls it "Confirmed".
export const CONFIRMED: Inquiry["status"] = "Contacted";

export const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: CONFIRMED },
];

export const isConfirmed = (r: Inquiry) => r.status === CONFIRMED;

export const statusLabel = (r: Inquiry) =>
  isConfirmed(r) ? "Confirmed" : "Pending";

export function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}
