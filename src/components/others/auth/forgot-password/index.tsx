"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Link, useRouter } from "@/i18n/navigation";
import { ChevronLeftIcon } from "@/icons";
import { errorMessage } from "@/lib/format";
import { authService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import SignInHeader from "../sign-in/header";

type Step = "email" | "otp" | "password";

const STEPS: { key: Step; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "otp", label: "Code" },
  { key: "password", label: "Password" },
];

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email");
      return;
    }
    run(async () => {
      const res = await authService.forgotSend(value);
      setEmail(value);
      setOtp("");
      setInfo(res.message);
      setStep("otp");
    });
  };

  const verify = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    run(async () => {
      const res = await authService.forgotVerify(email, otp);
      setResetToken(res.reset_token);
      setStep("password");
    });
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    run(async () => {
      const res = await authService.forgotReset({
        email,
        reset_token: resetToken,
        new_password: password,
        confirm_password: confirm,
      });
      toast.success(res.message);
      router.replace("/signin");
    });
  };

  const current = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
          Back to sign in
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <SignInHeader
          title="Forgot Password"
          description={
            step === "email"
              ? "Enter your registered email. We will send a 6-digit code to it."
              : step === "otp"
                ? `Enter the code sent to ${email}.`
                : "Choose a new password."
          }
        />

        <ol className="mb-6 flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full font-medium ${
                  i <= current
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <FormAlert type="error" message={error} />
        <FormAlert type="success" message={info} />

        {step === "email" && (
          <form onSubmit={sendCode} className="space-y-5" noValidate>
            <Field>
              <FieldLabel className="mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </Field>
            <Button className="w-full" size="lg" type="submit" loading={busy}>
              {busy ? "Sending..." : "Send code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verify} className="space-y-5" noValidate>
            <Field>
              <FieldLabel className="mb-1.5 block">
                6-digit code <span className="text-red-500">*</span>
              </FieldLabel>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                autoFocus
                inputMode="numeric"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Field>
            <Button className="w-full" size="lg" type="submit" loading={busy}>
              {busy ? "Checking..." : "Verify code"}
            </Button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                onClick={() => {
                  setError(null);
                  setStep("email");
                }}
              >
                Change email
              </button>
              <button
                type="button"
                disabled={busy}
                className="text-brand-500 hover:text-brand-600 disabled:opacity-50 dark:text-brand-400"
                onClick={() => sendCode()}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={reset} className="space-y-5" noValidate>
            <Field>
              <FieldLabel className="mb-1.5 block">
                New password <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel className="mb-1.5 block">
                Confirm password <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter the password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <Button className="w-full" size="lg" type="submit" loading={busy}>
              {busy ? "Saving..." : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
