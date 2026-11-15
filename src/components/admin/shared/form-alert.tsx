"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon, OctagonAlertIcon } from "@/icons";
import { useEffect } from "react";
import { toast } from "sonner";

interface FormAlertProps {
  type: "success" | "error";
  message?: string | null;
  /** Keep the message on the page (e.g. a page that failed to load) instead of a toast. */
  inline?: boolean;
}

// Shows its message as a toast. Use `inline` for errors that must stay on the page.
export default function FormAlert({ type, message, inline }: FormAlertProps) {
  useEffect(() => {
    if (inline || !message) return;
    if (type === "success") toast.success(message, { id: message });
    else toast.error(message, { id: message });
  }, [type, message, inline]);

  if (!inline || !message) return null;
  return (
    <Alert
      variant={type === "success" ? "success" : "destructive"}
      className="p-4"
    >
      {type === "success" ? (
        <CheckCircleIcon className="size-5" />
      ) : (
        <OctagonAlertIcon className="size-5" />
      )}
      <AlertTitle className="text-sm">{message}</AlertTitle>
    </Alert>
  );
}
