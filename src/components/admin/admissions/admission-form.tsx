"use client";

import ComponentCard from "@/components/common/component-card";
import DateInput from "@/components/admin/shared/date-input";
import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import PhoneInput from "@/components/admin/shared/phone-input";
import PhotoInput from "@/components/admin/shared/photo-input";
import RecordPickerDialog from "@/components/admin/shared/record-picker-dialog";
import SourceBanner from "@/components/admin/shared/source-banner";
import SelectBox from "@/components/admin/shared/select-field";
import StateCityFields from "@/components/admin/shared/state-city-fields";
import {
  useCourses,
  useReceptionists,
  withCurrentOption,
} from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GENDER_OPTIONS, ID_PROOF_OPTIONS } from "@/data/options";
import { toFormData } from "@/lib/api-client";
import { useRouter } from "@/i18n/navigation";
import { fileUrl } from "@/lib/config";
import { errorMessage, formatDate, todaySql } from "@/lib/format";
import { toast } from "sonner";
import { emailNewAdmission } from "@/lib/mail-record";
import { admissionService, inquiryService } from "@/services";
import type { Admission, Inquiry, Option } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useAdmin } from "@/hooks/use-can";
import { admissionSchema, type AdmissionFormData } from "./schema";

const emptyForm = (receptionistId = ""): AdmissionFormData => ({
  student_name: "",
  father_name: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  address: "",
  state: "",
  city: "",
  zip_code: "",
  identity_proof: "",
  identity_number: "",
  receptionist_id: receptionistId,
  course_id: "",
  form_fees: "",
  admission_date: todaySql(),
  special_offer: false,
  special_offer_text: "",
});

const admissionToForm = (a: Admission): AdmissionFormData => ({
  student_name: a.student_name,
  father_name: a.father_name || "",
  email: a.email || "",
  phone: a.phone,
  gender: a.gender || "",
  dob: a.dob ? a.dob.slice(0, 10) : "",
  address: a.address || "",
  state: a.state || "",
  city: a.city || "",
  zip_code: a.zip_code || "",
  identity_proof: a.identity_proof || "",
  identity_number: a.identity_number || "",
  receptionist_id: a.receptionist_id ? String(a.receptionist_id) : "",
  course_id: a.course_id ? String(a.course_id) : "",
  form_fees: a.form_fees ? String(Number(a.form_fees)) : "",
  admission_date: a.admission_date ? a.admission_date.slice(0, 10) : todaySql(),
  special_offer: Boolean(a.special_offer),
  special_offer_text: a.special_offer_text || "",
});

interface AdmissionFormProps {
  /** When given, the form edits this admission instead of creating a new one. */
  admission?: Admission;
}

type SelectName = "gender" | "identity_proof" | "receptionist_id" | "course_id";

export default function AdmissionForm({ admission }: AdmissionFormProps) {
  const router = useRouter();
  const { courseOptions } = useCourses();
  // A receptionist adding an admission is filled in (and locked) as the receptionist.
  const admin = useAdmin();
  const myReceptionistId =
    admin?.category === "receptionist" && admin.receptionist_id
      ? String(admin.receptionist_id)
      : "";
  const lockReceptionist =
    Boolean(myReceptionistId) && admin?.is_super === false;
  const receptionistList = useReceptionists();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: admission
      ? admissionToForm(admission)
      : emptyForm(myReceptionistId),
  });

  const specialOffer = useWatch({ control, name: "special_offer" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fromInquiry, setFromInquiry] = useState<Inquiry | null>(null);
  const receptionistOptions = useMemo(
    () =>
      withCurrentOption(
        withCurrentOption(
          receptionistList,
          admission?.receptionist_id,
          admission?.receptionist_name,
        ),
        fromInquiry?.receptionist_id,
        fromInquiry?.receptionist_name,
      ),
    [receptionistList, admission, fromInquiry],
  );

  // Copy everything the inquiry already has; the rest stays as typed.
  const applyInquiry = (inq: Inquiry) => {
    reset({
      ...getValues(),
      student_name: inq.student_name,
      email: inq.email || "",
      phone: inq.phone,
      gender: inq.gender || "",
      address: inq.address || "",
      state: inq.state || "",
      city: inq.city || "",
      zip_code: inq.zip_code || "",
      receptionist_id:
        myReceptionistId ||
        (inq.receptionist_id ? String(inq.receptionist_id) : ""),
      course_id: inq.course_id ? String(inq.course_id) : "",
    });
    setFromInquiry(inq);
  };

  const clearForm = () => {
    reset(admission ? admissionToForm(admission) : emptyForm(myReceptionistId));
    setPhoto(null);
    setPhotoError(undefined);
    setResetKey((k) => k + 1);
    setFromInquiry(null);
  };

  useEffect(() => {
    if (myReceptionistId && (!admission || lockReceptionist))
      setValue("receptionist_id", myReceptionistId);
  }, [myReceptionistId, admission, lockReceptionist, setValue]);

  const onSubmit = async (data: AdmissionFormData) => {
    setMessage(null);
    try {
      const body = toFormData(
        {
          ...data,
          special_offer: data.special_offer ? "1" : "0",
          special_offer_text: data.special_offer ? data.special_offer_text : "",
          from_inquiry_id: fromInquiry?.id ?? "",
        },
        { photo },
      );
      if (admission) {
        await admissionService.update(admission.id, body);
        toast.success("Admission updated successfully");
        router.push("/admissions");
        return;
      }
      const res = await admissionService.create(body);
      const saved = `Admission saved. Admission No: ${res.admission_no}`;
      toast.success(saved);
      // Email the admission PDF to the student (only when an email was entered).
      if (data.email) {
        emailNewAdmission(res.id).then((note) => {
          if (!note) return;
          if (note.ok) toast.success(note.text);
          else toast.error(note.text);
        });
      }
      router.push("/admissions");
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  const select = (
    name: SelectName,
    options: Option[],
    placeholder: string,
    disabled?: boolean,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <SelectBox
          options={options}
          value={field.value}
          onChange={field.onChange}
          placeholder={placeholder}
          invalid={Boolean(errors[name])}
          disabled={disabled}
        />
      )}
    />
  );

  return (
    <ComponentCard
      title={
        admission
          ? `Edit Admission (${admission.admission_no})`
          : "Add Admission"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert type={message?.type ?? "success"} message={message?.text} />

        {!admission && (
          <SourceBanner
            sourceLabel="Inquiry"
            picked={
              fromInquiry
                ? `${fromInquiry.inquiry_no} · ${fromInquiry.student_name}`
                : null
            }
            hint="Converting an inquiry? Pick it to fill the details automatically."
            onPick={() => setPickerOpen(true)}
            onClear={() => setFromInquiry(null)}
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Student Name"
            required
            error={errors.student_name?.message}
          >
            <Input
              {...register("student_name")}
              placeholder="Enter student name"
            />
          </FormField>
          <FormField label="Student Photo (max 10MB)" error={photoError}>
            <PhotoInput
              file={photo}
              existingUrl={fileUrl(admission?.photo || fromInquiry?.photo)}
              resetKey={resetKey}
              onChange={(f, err) => {
                setPhoto(f);
                setPhotoError(err);
              }}
            />
          </FormField>
          <FormField label="Father's Name">
            <Input
              {...register("father_name")}
              placeholder="Enter father's name"
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="info@gmail.com"
            />
          </FormField>
          <FormField
            label="Phone Number"
            required
            error={errors.phone?.message}
          >
            <PhoneInput
              {...register("phone")}
              placeholder="Enter phone number"
            />
          </FormField>
          <FormField label="Date of Birth">
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Gender">
            {select("gender", GENDER_OPTIONS, "Select Gender")}
          </FormField>
          <FormField label="Address" className="md:col-span-2">
            <Textarea
              {...register("address")}
              rows={3}
              placeholder="Enter address"
            />
          </FormField>

          <Controller
            control={control}
            name="state"
            render={({ field: s }) => (
              <Controller
                control={control}
                name="city"
                render={({ field: c }) => (
                  <StateCityFields
                    required
                    state={s.value}
                    city={c.value}
                    onStateChange={s.onChange}
                    onCityChange={c.onChange}
                    stateError={errors.state?.message}
                    cityError={errors.city?.message}
                  />
                )}
              />
            )}
          />

          <FormField label="Zip Code" error={errors.zip_code?.message}>
            <Input
              {...register("zip_code")}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter zip code"
            />
          </FormField>
          <FormField label="Identity Proof Type">
            {select(
              "identity_proof",
              ID_PROOF_OPTIONS,
              "Select Identity Proof",
            )}
          </FormField>
          <FormField
            label="Identity Proof Number"
            error={errors.identity_number?.message}
          >
            <Input
              {...register("identity_number")}
              placeholder="e.g. 3802 5028 7301"
            />
          </FormField>
          <FormField
            label="Receptionist"
            required
            error={errors.receptionist_id?.message}
          >
            {select(
              "receptionist_id",
              receptionistOptions,
              receptionistOptions.length
                ? "Select Receptionist"
                : "No receptionist yet: add a role with category Receptionist",
              lockReceptionist,
            )}
          </FormField>
          <FormField label="Course" required error={errors.course_id?.message}>
            {select("course_id", courseOptions, "Select Course")}
          </FormField>
          <FormField
            label="Admission Form Fees"
            error={errors.form_fees?.message}
          >
            <Input
              {...register("form_fees")}
              inputMode="decimal"
              placeholder="0.00"
            />
          </FormField>
          <FormField
            label="Date of Admission"
            error={errors.admission_date?.message}
          >
            <Controller
              control={control}
              name="admission_date"
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <div className="space-y-3 md:col-span-2">
            <Field
              orientation="horizontal"
              className="w-auto items-center gap-3"
            >
              <Controller
                control={control}
                name="special_offer"
                render={({ field }) => (
                  <Checkbox
                    id="special-offer"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(Boolean(c))}
                  />
                )}
              />
              <FieldLabel
                htmlFor="special-offer"
                className="cursor-pointer font-normal"
              >
                Special Offer Available
              </FieldLabel>
            </Field>
            {specialOffer && (
              <FormField
                label="Special Offer Details"
                required
                error={errors.special_offer_text?.message}
              >
                <Input
                  {...register("special_offer_text")}
                  autoFocus
                  maxLength={255}
                  placeholder="e.g. 12% discount on course fee"
                />
              </FormField>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {admission ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admissions")}
            >
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={clearForm}>
              Reset
            </Button>
          )}
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : admission
                ? "Update Admission"
                : "Submit Admission"}
          </Button>
        </div>
      </form>

      <RecordPickerDialog<Inquiry>
        open={pickerOpen}
        title="Select from Inquiries"
        searchPlaceholder="Search name, phone, email or form no"
        load={(search) => inquiryService.list({ search })}
        toRow={(r) => ({
          id: r.id,
          title: r.student_name,
          subtitle: [r.phone, r.course_name, r.city]
            .filter(Boolean)
            .join(" · "),
          meta: `#${r.inquiry_no} · ${formatDate(r.inquiry_date)}`,
          photo: r.photo ? fileUrl(r.photo) : undefined,
          badge:
            r.status === "Pending"
              ? { label: "Pending", color: "warning" }
              : { label: "Confirmed", color: "success" },
        })}
        onUse={applyInquiry}
        onClose={() => setPickerOpen(false)}
      />
    </ComponentCard>
  );
}
