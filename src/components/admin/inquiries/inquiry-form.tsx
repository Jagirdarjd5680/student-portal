"use client";

import ComponentCard from "@/components/common/component-card";
import DateInput from "@/components/admin/shared/date-input";
import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import PhoneInput from "@/components/admin/shared/phone-input";
import PhotoInput from "@/components/admin/shared/photo-input";
import SelectBox from "@/components/admin/shared/select-field";
import StateCityFields from "@/components/admin/shared/state-city-fields";
import {
  useCourses,
  useReceptionists,
  withCurrentOption,
} from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GENDER_OPTIONS, INQUIRY_SOURCE_OPTIONS } from "@/data/options";
import { useRouter } from "@/i18n/navigation";
import { toFormData } from "@/lib/api-client";
import { fileUrl } from "@/lib/config";
import { errorMessage, todaySql } from "@/lib/format";
import { emailNewInquiry } from "@/lib/mail-record";
import { inquiryService } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { useAdmin } from "@/hooks/use-can";
import type { Inquiry } from "@/types";
import { inquirySchema, type InquiryFormData } from "./schema";

const emptyForm = (receptionistId = ""): InquiryFormData => ({
  student_name: "",
  email: "",
  phone: "",
  gender: "",
  address: "",
  state: "",
  city: "",
  zip_code: "",
  receptionist_id: receptionistId,
  course_id: "",
  source: "",
  inquiry_date: todaySql(),
});

const inquiryToForm = (r: Inquiry): InquiryFormData => ({
  student_name: r.student_name,
  email: r.email || "",
  phone: r.phone,
  gender: r.gender || "",
  address: r.address || "",
  state: r.state || "",
  city: r.city || "",
  zip_code: r.zip_code || "",
  receptionist_id: r.receptionist_id ? String(r.receptionist_id) : "",
  course_id: r.course_id ? String(r.course_id) : "",
  source: r.source || "",
  inquiry_date: r.inquiry_date ? r.inquiry_date.slice(0, 10) : todaySql(),
});

interface InquiryFormProps {
  /** When given, the form edits this inquiry instead of creating a new one. */
  inquiry?: Inquiry;
}

export default function InquiryForm({ inquiry }: InquiryFormProps) {
  const router = useRouter();
  const { courseOptions } = useCourses();
  // A receptionist adding an inquiry is filled in (and locked) as the receptionist.
  const admin = useAdmin();
  const myReceptionistId =
    admin?.category === "receptionist" && admin.receptionist_id
      ? String(admin.receptionist_id)
      : "";
  const lockReceptionist =
    Boolean(myReceptionistId) && admin?.is_super === false;
  const receptionistList = useReceptionists();
  const receptionistOptions = useMemo(
    () =>
      withCurrentOption(
        receptionistList,
        inquiry?.receptionist_id,
        inquiry?.receptionist_name,
      ),
    [receptionistList, inquiry?.receptionist_id, inquiry?.receptionist_name],
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [photoKey, setPhotoKey] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: inquiry
      ? inquiryToForm(inquiry)
      : emptyForm(myReceptionistId),
  });

  // The linked receptionist can arrive after the first render (stored profile refresh).
  useEffect(() => {
    if (myReceptionistId && (!inquiry || lockReceptionist))
      setValue("receptionist_id", myReceptionistId);
  }, [myReceptionistId, inquiry, lockReceptionist, setValue]);

  const onSubmit = async (data: InquiryFormData) => {
    setMessage(null);
    try {
      const body = toFormData(data, { photo });
      if (inquiry) {
        await inquiryService.update(inquiry.id, body);
        toast.success("Inquiry updated successfully");
        router.push("/inquiries");
        return;
      }
      const res = await inquiryService.create(body);
      const saved = `Inquiry saved. Inquiry No: ${res.inquiry_no}`;
      toast.success(saved);
      // Email the inquiry PDF to the student (only when an email was entered).
      if (data.email) {
        emailNewInquiry(res.id).then((note) => {
          if (!note) return;
          if (note.ok) toast.success(note.text);
          else toast.error(note.text);
        });
      }
      router.push("/inquiries");
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  const resetAll = () => {
    reset(inquiry ? inquiryToForm(inquiry) : emptyForm(myReceptionistId));
    setPhoto(null);
    setPhotoError(undefined);
    setPhotoKey((k) => k + 1);
  };

  const selectController = (
    name: "gender" | "receptionist_id" | "course_id" | "source",
    options: { label: string; value: string }[],
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
      title={inquiry ? `Edit Inquiry (${inquiry.inquiry_no})` : "Add Inquiry"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert type={message?.type ?? "success"} message={message?.text} />

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
          <FormField label="Gender">
            {selectController("gender", GENDER_OPTIONS, "Select Gender")}
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
            render={({ field: stateField }) => (
              <Controller
                control={control}
                name="city"
                render={({ field: cityField }) => (
                  <StateCityFields
                    state={stateField.value}
                    city={cityField.value}
                    onStateChange={stateField.onChange}
                    onCityChange={cityField.onChange}
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
          <FormField
            label="Receptionist"
            required
            error={errors.receptionist_id?.message}
          >
            {selectController(
              "receptionist_id",
              receptionistOptions,
              receptionistOptions.length
                ? "Select Receptionist"
                : "No receptionist yet: add a role with category Receptionist",
              lockReceptionist,
            )}
          </FormField>
          <FormField label="Course" required error={errors.course_id?.message}>
            {selectController("course_id", courseOptions, "Select Course")}
          </FormField>
          <FormField label="Source of Inquiry">
            {selectController(
              "source",
              INQUIRY_SOURCE_OPTIONS,
              "Select Source",
            )}
          </FormField>
          <FormField
            label="Date of Inquiry"
            error={errors.inquiry_date?.message}
          >
            <Controller
              control={control}
              name="inquiry_date"
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Photo (max 10MB)" error={photoError}>
            <PhotoInput
              file={photo}
              existingUrl={fileUrl(inquiry?.photo)}
              resetKey={photoKey}
              onChange={(f, err) => {
                setPhoto(f);
                setPhotoError(err);
              }}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          {inquiry ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inquiries")}
            >
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={resetAll}>
              Reset
            </Button>
          )}
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : inquiry
                ? "Update Inquiry"
                : "Submit Inquiry"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
