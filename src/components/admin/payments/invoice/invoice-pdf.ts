// Payment → "Tax Invoice" PDF, laid out like the approved invoice design
// (white page, orange accents, GST split into SGST/CGST). Downloads directly.
import { INSTITUTE_NAME } from "@/data/institute";
import { amountToWords } from "@/lib/number-to-words";
import { loadLogo, newPdf } from "@/lib/pdf";
import type { InvoiceData } from "@/types";
import type { jsPDF } from "jspdf";

const C = {
  heading: "#2C3E50",
  text: "#333333",
  muted: "#555555",
  orange: "#F39C12",
  rule: "#F8C471",
  border: "#D5D8DC",
};
const M = 14; // page margin (mm)
const RUPEE_FONT = "Geist";

let fontCache: Promise<string | null> | null = null;

/** Geist contains the ₹ glyph (Helvetica doesn't). Cached base64 TTF. */
function loadRupeeFont() {
  fontCache ??= fetch("/fonts/Geist-Regular.ttf")
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
    .then((buf) => {
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(bin);
    })
    .catch(() => {
      fontCache = null;
      return null;
    });
  return fontCache;
}

const fmt = (v: number) =>
  Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** dd-mm-yyyy */
function dmy(value?: string | null) {
  if (!value) return "-";
  const [y, m, d] = value.slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : value;
}

export async function downloadInvoicePdf(data: InvoiceData) {
  const [doc, logo, rupeeFont] = await Promise.all([
    newPdf(),
    loadLogo(),
    loadRupeeFont(),
  ]);
  const { institute, payment, item, totals } = data;
  const name = (institute.name || INSTITUTE_NAME).toUpperCase();
  const W = doc.internal.pageSize.getWidth();
  const R = W - M;

  // ₹ needs the embedded font; fall back to "Rs." if it couldn't load.
  if (rupeeFont) {
    doc.addFileToVFS("Geist-Regular.ttf", rupeeFont);
    doc.addFont("Geist-Regular.ttf", RUPEE_FONT, "normal");
  }
  const money = (v: number) => (rupeeFont ? `₹ ${fmt(v)}` : `Rs. ${fmt(v)}`);
  /** Draw an amount; "bold" is faked by a tiny double-strike (Geist is regular only). */
  const amount = (
    doc: jsPDF,
    v: number,
    x: number,
    y: number,
    size: number,
    bold = false,
    color = C.text,
  ) => {
    doc.setFont(
      rupeeFont ? RUPEE_FONT : "helvetica",
      rupeeFont ? "normal" : bold ? "bold" : "normal",
    );
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(money(v), x, y, { align: "right" });
    if (bold && rupeeFont) doc.text(money(v), x + 0.12, y, { align: "right" });
  };

  // ── Header: institute (left) + logo (right) ──────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(C.heading);
  doc.text(name, M, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.muted);
  const addr: string[] = institute.address
    ? institute.address
        .split(/\r?\n/)
        .flatMap((l) => doc.splitTextToSize(l.trim(), 105))
    : [];
  const headerLines = [
    ...addr,
    institute.phone && `Phone no.: ${institute.phone}`,
    institute.email && `Email : ${institute.email}`,
    institute.website && `Website : ${institute.website}`,
    institute.gstin && `GSTIN : ${institute.gstin}`,
  ].filter(Boolean) as string[];
  let y = 26;
  headerLines.forEach((l) => {
    doc.text(l, M, y);
    y += 4.4;
  });
  if (logo) doc.addImage(logo, "PNG", R - 26, 12, 26, 26);

  y = Math.max(y, 40) + 2;
  doc.setDrawColor(C.rule);
  doc.setLineWidth(0.5);
  doc.line(M, y, R, y);

  // ── Title ────────────────────────────────────────────────────────────
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(C.orange);
  doc.text("Tax Invoice", W / 2, y, { align: "center" });

  // ── Bill To / Invoice Details ────────────────────────────────────────
  y += 13;
  doc.setFontSize(9.5);
  doc.setTextColor(C.heading);
  doc.text("Bill To", M, y);
  doc.text("Invoice Details", R, y, { align: "right" });

  y += 7;
  doc.setFontSize(8.5);
  doc.setTextColor(C.text);
  doc.text(payment.student_name || "-", M, y);
  // Right: "Invoice No.: <bold number>"
  const invNo = payment.invoice_no;
  doc.setFont("helvetica", "bold");
  const invW = doc.getTextWidth(invNo);
  doc.text(invNo, R, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(C.muted);
  doc.text("Invoice No.: ", R - invW, y, { align: "right" });

  doc.setFontSize(8);
  const billLines: string[] = [
    ...(payment.student_address
      ? payment.student_address
          .split(/\r?\n/)
          .flatMap((l) => doc.splitTextToSize(l.trim(), 110))
      : []),
    payment.student_phone ? `Contact No.: ${payment.student_phone}` : "",
  ].filter(Boolean);
  let by = y + 5;
  billLines.forEach((l) => {
    doc.text(l, M, by);
    by += 4.4;
  });
  doc.text(`Date: ${dmy(payment.payment_date)}`, R, y + 5, { align: "right" });
  y = Math.max(by, y + 10) + 1;

  // ── Item table ───────────────────────────────────────────────────────
  const { autoTable } = await import("jspdf-autotable");
  const gst = totals.sgst + totals.cgst;
  const amountFont = rupeeFont ? RUPEE_FONT : "helvetica";
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "grid",
    head: [
      [
        "#",
        "Item name",
        "HSN/ SAC",
        "Quantity",
        "Price/ Unit",
        "GST",
        "Amount",
      ],
    ],
    body: [
      [
        "1",
        item.name || payment.description || "Course Fee",
        item.hsn,
        String(item.quantity),
        money(totals.subTotal),
        `${money(gst)}\n(18%)`,
        money(totals.total),
      ],
    ],
    foot: [
      [
        { content: "Total (Net)", colSpan: 5, styles: { halign: "center" } },
        money(gst),
        money(totals.total),
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      textColor: C.text,
      lineColor: C.border,
      lineWidth: 0.2,
      cellPadding: { top: 2.6, bottom: 2.6, left: 2, right: 2 },
      valign: "middle",
    },
    headStyles: {
      fillColor: C.orange,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "right",
    },
    footStyles: {
      fillColor: "#FFFFFF",
      textColor: C.text,
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" },
      1: { halign: "left" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 20, halign: "right" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 26, halign: "right" },
    },
    didParseCell: (cell) => {
      if (cell.section === "head" && cell.column.index <= 1)
        cell.cell.styles.halign = cell.column.index === 0 ? "center" : "left";
      // Amount columns use the ₹-capable font.
      if (cell.column.index >= 4 && cell.section !== "head") {
        cell.cell.styles.font = amountFont;
        if (rupeeFont) cell.cell.styles.fontStyle = "normal";
      }
    },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = (doc.lastAutoTable?.finalY as number) + 12;

  // ── Words + terms (left) ─────────────────────────────────────────────
  const leftW = 92;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(C.heading);
  doc.text("Invoice Amount In Words", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(C.text);
  const words: string[] = doc.splitTextToSize(
    amountToWords(totals.total),
    leftW,
  );
  doc.text(words, M, y + 6);
  let ly = y + 6 + words.length * 3.8 + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(C.heading);
  doc.text("Terms and Conditions", M, ly);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(C.text);
  const terms = institute.terms?.length
    ? institute.terms
    : ["Terms and Conditions Apply"];
  ly += 6;
  terms.forEach((t) => {
    const lines: string[] = doc.splitTextToSize(t, leftW);
    doc.text(lines, M, ly);
    ly += lines.length * 3.8 + 1;
  });

  // ── Totals (right) ───────────────────────────────────────────────────
  const tx = 118;
  let ty = y + 1;
  const totalRow = (label: string, v: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(C.text);
    doc.text(label, tx + 2, ty);
    amount(doc, v, R - 2, ty, 8);
    ty += 7.5;
  };
  totalRow("Sub Total", totals.subTotal);
  totalRow("SGST@9%", totals.sgst);
  totalRow("CGST@9%", totals.cgst);
  doc.setFillColor(C.orange);
  doc.rect(tx, ty - 5, R - tx, 8.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor("#FFFFFF");
  doc.text("Total", tx + 2, ty + 0.6);
  amount(doc, totals.total, R - 2, ty + 0.6, 9.5, true, "#FFFFFF");
  ty += 8;

  // ── Signature ────────────────────────────────────────────────────────
  const sy = Math.max(ty, ly) + 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(C.text);
  doc.text(`For: ${name}`, R, sy, { align: "right" });
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(R - 55, sy + 15, R, sy + 15);
  doc.text("Authorized Signatory", R, sy + 21, { align: "right" });
  doc.setDrawColor("#EEEEEE");
  doc.line(M - 6, sy + 30, R + 6, sy + 30);

  doc.save(`invoice-${payment.invoice_no}.pdf`);
}
