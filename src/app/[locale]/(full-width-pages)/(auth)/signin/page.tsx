import SignIn from "@/components/others/auth/sign-in";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | God of Graphics - Next.js Dashboard Template",
  description: "This is Next.js Signin Page God of Graphics Dashboard Template",
};

export default function SignInPage() {
  return <SignIn />;
}
