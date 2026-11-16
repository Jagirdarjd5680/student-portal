import SignUpForm from "@/components/others/auth/sign-up";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | God of Graphics - Next.js Dashboard Template",
  description: "This is Next.js SignUp Page God of Graphics Dashboard Template",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
