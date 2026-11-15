"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import SelectBox from "@/components/admin/shared/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { EyeCloseIcon, EyeIcon, SendIcon } from "@/icons";
import { errorMessage } from "@/lib/format";
import { settingsService, type AppSettings } from "@/services";
import { useState } from "react";
import { useTabSave, type TabProps } from "./use-tab-save";

const KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_secure",
  "smtp_user",
  "smtp_pass",
  "smtp_from_name",
  "smtp_from_email",
  "mail_auto",
] as const satisfies readonly (keyof AppSettings)[];

const SECURE_OPTIONS = [
  { label: "TLS / STARTTLS (port 587)", value: "tls" },
  { label: "SSL (port 465)", value: "ssl" },
  { label: "None (port 25)", value: "none" },
];

// One-click starting points; the user still adds username and password.
const PRESETS = [
  { name: "Gmail", host: "smtp.gmail.com", port: "587", secure: "tls" },
  {
    name: "Outlook / Microsoft 365",
    host: "smtp.office365.com",
    port: "587",
    secure: "tls",
  },
  { name: "Zoho", host: "smtp.zoho.in", port: "465", secure: "ssl" },
  { name: "Brevo", host: "smtp-relay.brevo.com", port: "587", secure: "tls" },
];

export default function SmtpTab({
  initial,
  onSaved,
  canEdit = true,
}: TabProps) {
  const { values, set, save, saving, error, saved } = useTabSave(
    initial,
    KEYS,
    onSaved,
  );
  const [showPass, setShowPass] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const passSaved = initial.smtp_pass_set;

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await settingsService.testSmtp({
        to: testTo,
        smtp_host: values.smtp_host,
        smtp_port: values.smtp_port,
        smtp_secure: values.smtp_secure,
        smtp_user: values.smtp_user,
        smtp_pass: values.smtp_pass,
        smtp_from_name: values.smtp_from_name,
        smtp_from_email: values.smtp_from_email,
      });
      setTestResult({
        ok: true,
        text: `Test email sent to ${testTo}. Check the inbox (and spam).`,
      });
    } catch (err) {
      setTestResult({ ok: false, text: errorMessage(err) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <form
        className="space-y-5 xl:col-span-3"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <fieldset
          disabled={!canEdit}
          className="m-0 min-w-0 space-y-5 border-0 p-0"
        >
          <FormAlert type="error" message={error} />
          <FormAlert
            type="success"
            message={saved ? "Email settings saved." : null}
          />

          <div>
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Quick setup
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.name}
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    set("smtp_host", p.host);
                    set("smtp_port", p.port);
                    set("smtp_secure", p.secure);
                  }}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <Checkbox
              checked={values.mail_auto !== "0"}

              onCheckedChange={(on) => set("mail_auto", on ? "1" : "0")}

              aria-label="Email PDFs automatically"
            />

            <span>
              <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                Email PDFs automatically
              </span>

              <span className="block text-xs text-gray-500 dark:text-gray-400">
                A new inquiry or admission is emailed to the student with its
                PDF. A new student gets the admission and inquiry PDFs. Needs an
                email on the record.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="SMTP Host" required>
              <Input
                value={values.smtp_host}
                onChange={(e) => set("smtp_host", e.target.value)}
                placeholder="smtp.gmail.com"
                autoComplete="off"
              />
            </FormField>
            <FormField label="SMTP Port" required>
              <Input
                value={values.smtp_port}
                onChange={(e) =>
                  set("smtp_port", e.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                placeholder="587"
              />
            </FormField>
            <FormField label="Encryption">
              <SelectBox
                options={SECURE_OPTIONS}
                value={values.smtp_secure || "tls"}
                onChange={(v) => set("smtp_secure", v || "tls")}
                placeholder="Encryption"
              />
            </FormField>
            <FormField label="Username">
              <Input
                value={values.smtp_user}
                onChange={(e) => set("smtp_user", e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="off"
              />
            </FormField>
            <FormField label="Password" className="md:col-span-2">
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={values.smtp_pass}
                  onChange={(e) => set("smtp_pass", e.target.value)}
                  placeholder={
                    passSaved
                      ? "Saved: leave blank to keep it"
                      : "SMTP / App password"
                  }
                  autoComplete="new-password"
                  className="pe-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeCloseIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5 fill-current" />
                  )}
                </button>
              </div>
              <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {passSaved && (
                  <Badge size="sm" color="success">
                    Password saved
                  </Badge>
                )}
                Stored encrypted. For Gmail use an App Password, not your normal
                password.
              </p>
            </FormField>
            <FormField label="From Name">
              <Input
                value={values.smtp_from_name}
                onChange={(e) => set("smtp_from_name", e.target.value)}
                placeholder="God of Graphics"
              />
            </FormField>
            <FormField label="From Email">
              <Input
                value={values.smtp_from_email}
                onChange={(e) => set("smtp_from_email", e.target.value)}
                type="email"
                placeholder="Same as username if blank"
              />
            </FormField>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Save Email Settings"}
              </Button>
            </div>
          )}
        </fieldset>
      </form>

      {canEdit && (
        <aside className="xl:sticky xl:top-24 xl:col-span-2 xl:self-start">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-white/3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                Send a test email
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Uses the values on this screen (no need to save first), so you
                can check the settings before keeping them.
              </p>
            </div>
            <FormField label="Send test to">
              <Input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                type="email"
                placeholder="your@email.com"
              />
            </FormField>
            <Button
              type="button"
              className="w-full"
              loading={testing}
              disabled={!testTo || !values.smtp_host}
              onClick={sendTest}
            >
              {!testing && <SendIcon />}{" "}
              {testing ? "Sending..." : "Send Test Email"}
            </Button>
            {testResult && (
              <FormAlert
                type={testResult.ok ? "success" : "error"}
                message={testResult.text}
              />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
