"use client";

import { errorMessage } from "@/lib/format";
import { paymentService } from "@/services";
import { useState } from "react";
import { downloadInvoicePdf } from "./invoice-pdf";

/** Click → fetch invoice data → download the PDF. Tracks which one is busy. */
export function useInvoiceDownload() {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (paymentId: number) => {
    setBusyId(paymentId);
    setError(null);
    try {
      await downloadInvoicePdf(await paymentService.invoice(paymentId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return { download, busyId, error };
}
