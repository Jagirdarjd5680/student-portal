"use client";

import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INSTITUTE_LOGO } from "@/data/institute";
import type { AppSettings } from "@/services";
import { useTabSave, type TabProps } from "./use-tab-save";

const KEYS = [
  "inst_name",
  "inst_address",
  "inst_phone",
  "inst_email",
  "inst_website",
  "inst_gstin",
  "inst_terms",
] as const satisfies readonly (keyof AppSettings)[];

// Lines that will print in the PDF header, so the effect of each field is visible.
function HeaderPreview({ v }: { v: Pick<AppSettings, (typeof KEYS)[number]> }) {
  const lines = [
    ...v.inst_address
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
    v.inst_phone && `Phone no.: ${v.inst_phone}`,
    v.inst_email && `Email : ${v.inst_email}`,
    v.inst_website && `Website : ${v.inst_website}`,
    v.inst_gstin && `GSTIN : ${v.inst_gstin.toUpperCase()}`,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 text-gray-800 dark:border-gray-800">
      <p className="mb-3 text-xs font-medium tracking-wide text-gray-400 uppercase">
        Invoice header preview
      </p>
      <div className="flex items-start justify-between gap-4 border-b-2 border-orange-200 pb-4">
        <div className="min-w-0">
          <p className="text-lg font-bold text-slate-700">
            {(v.inst_name || "Institute name").toUpperCase()}
          </p>
          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
            {lines.length ? (
              lines.map((l, i) => <p key={i}>{l}</p>)
            ) : (
              <p className="text-gray-400">Address, phone…</p>
            )}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={INSTITUTE_LOGO}
          alt=""
          className="size-14 shrink-0 object-contain"
        />
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-orange-500">
        Tax Invoice
      </p>
      <p className="mt-3 text-[0.7rem] text-gray-500">
        Fields left empty are not printed. This header is also used for the name
        on Inquiry and Admission PDFs.
      </p>
    </div>
  );
}

// Name, address and contact details printed on every PDF (all optional except the name).
export default function InstituteTab({
  initial,
  onSaved,
  canEdit = true,
}: TabProps) {
  const { values, set, save, saving, error, saved } = useTabSave(
    initial,
    KEYS,
    onSaved,
  );

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
            message={
              saved ? "Institute details saved. New PDFs use them now." : null
            }
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Institute / Business Name"
              required
              className="md:col-span-2"
            >
              <Input
                value={values.inst_name}
                onChange={(e) => set("inst_name", e.target.value)}
                placeholder="GOD OF GRAPHICS"
              />
            </FormField>
            <FormField label="Address" className="md:col-span-2">
              <Textarea
                rows={4}
                value={values.inst_address}
                onChange={(e) => set("inst_address", e.target.value)}
                placeholder={
                  "Pal Rd, near Barkhatullah Khan Stadium, opp.\nACP Office, Masuria Colony…"
                }
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Each line prints on its own line.
              </p>
            </FormField>
            <FormField label="Mobile Number">
              <Input
                value={values.inst_phone}
                onChange={(e) => set("inst_phone", e.target.value)}
                placeholder="8905561612"
                inputMode="tel"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={values.inst_email}
                onChange={(e) => set("inst_email", e.target.value)}
                type="email"
                placeholder="info@example.com"
              />
            </FormField>
            <FormField label="Website">
              <Input
                value={values.inst_website}
                onChange={(e) => set("inst_website", e.target.value)}
                placeholder="www.example.com"
              />
            </FormField>
            <FormField label="GST Number (optional)">
              <Input
                value={values.inst_gstin}
                onChange={(e) =>
                  set("inst_gstin", e.target.value.toUpperCase())
                }
                maxLength={15}
                placeholder="08ABCDE1234F1Z5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Printed on the invoice only when filled.
              </p>
            </FormField>
            <FormField
              label="Invoice Terms & Conditions"
              className="md:col-span-2"
            >
              <Textarea
                rows={3}
                value={values.inst_terms}
                onChange={(e) => set("inst_terms", e.target.value)}
                placeholder={
                  "Fees once paid are non-refundable.\nThis is a computer generated invoice."
                }
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                One term per line.
              </p>
            </FormField>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Save Details"}
              </Button>
            </div>
          )}
        </fieldset>
      </form>

      <aside className="xl:sticky xl:top-24 xl:col-span-2 xl:self-start">
        <HeaderPreview v={values} />
      </aside>
    </div>
  );
}
