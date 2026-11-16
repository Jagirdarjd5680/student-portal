import ForgotPassword from "@/components/others/auth/forgot-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | God of Graphics",
  description: "Reset your God of Graphics password with an email code.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
