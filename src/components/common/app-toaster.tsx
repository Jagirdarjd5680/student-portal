"use client";

import { useTheme } from "@/context/theme-context";
import { Toaster } from "sonner";

// Global toast area (top-right), follows the light / dark theme.
export default function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={theme}
      richColors
      closeButton
      duration={5000}
    />
  );
}
