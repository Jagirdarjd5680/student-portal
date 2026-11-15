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
import {
  useCourses,
  useDurations,
} from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DISCOUNT_TYPE_OPTIONS } from "@/data/options";
import { useRouter } from "@/i18n/navigation";
import { toFormData } from "@/lib/api-client";
import { fileUrl } from "@/lib/config";
import { errorMessage, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { emailNewStudent } from "@/lib/mail-record";
import { admissionService, studentService } from "@/services";
import type { Admission, Student } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FeeSummary from "./fee-summary";
import {
  calcFee,
  emptyStudent,
  makeStudentSchema,
  ALL_PORTAL_MENUS,
  PORTAL_MENU_OPTIONS,
  parsePortalMenus,
  studentToForm,
  type StudentFormData,
} from "./schema";

interface StudentFormProps {
  student?: Student;
}

export default function StudentForm({ student }: StudentFormProps) {
  const router = useRouter();
  const { courses, courseOptions } = useCourses();
  const { durationOptions } = useDurations();
  const [photo, setPhoto] = useState<File | null>(null);
  const [menus, setMenus] = useState<string[]>(() =>
    student ? parsePortalMenus(student.portal_menus) : ALL_PORTAL_MENUS,
  );
  const [photoError, setPhotoError] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(makeStudentSchema(Boolean(student))),
    defaultValues: student ? studentToForm(student) : emptyStudent(),
  });

  const [courseId, discountType, discountValue] = watch([
    "course_id",
    "discount_type",
    "discount_value",
  ]);
  const course = courses.find((c) => String(c.id) === courseId);
  const fee = course
    ? Number(course.fee)
    : student && String(student.course_id) === courseId
      ? Number(student.course_fee)
      : 0;
  const { discount, total } = calcFee(
    fee,
    discountType,
    Number(discountValue) || 0,
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [fromAdmission, setFromAdmission] = useState<Admission | null>(null);

  // Copy what the admission already has; fee/discount stay for you to fill.
  const applyAdmission = (a: Admission) => {
    const [first, ...rest] = a.student_name.trim().split(/\s+/);
    const course = courses.find((c) => c.id === a.course_id);
    reset({
      ...getValues(),
      first_name: first || "",
      last_name: rest.join(" "),
      email: a.email || "",
      phone: a.phone || "",
      dob: a.dob ? a.dob.slice(0, 10) : getValues("dob"),
      admission_date: a.admission_date ? a.admission_date.slice(0, 10) : "",
      address: [
        a.address,
        [a.city, a.state].filter(Boolean).join(", "),
        a.zip_code,
      ]
        .filter(Boolean)
        .join("\n"),
      course_id: a.course_id ? String(a.course_id) : getValues("course_id"),
      duration_id: course?.duration_id
        ? String(course.duration_id)
        : getValues("duration_id"),
    });
    setFromAdmission(a);
  };

  const onSubmit = async (data: StudentFormData) => {
    setError(null);
    try {
      const body = toFormData(
        {
          ...data,
          from_admission_id: fromAdmission?.id ?? "",
          portal_menus: JSON.stringify(menus),
        },
        { photo },
      );
      const res = student
        ? await studentService.update(student.id, body)
        : await studentService.create(body);
      toast.success(
        student ? "Student updated successfully" : "Student saved successfully",
      );
      // New student: mail the admission (and inquiry) PDFs; the result shows as a toast.
      if (!student && data.email) {
        emailNewStudent(res.id, fromAdmission?.id).then((note) => {
          if (!note) return;
          if (note.ok) toast.success(note.text);
          else toast.error(note.text);
        });
      }
      router.push(`/students/${res.id}`);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const dateField = (name: "dob" | "admission_date") => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DateInput value={field.value} onChange={field.onChange} />
      )}
    />
  );

  return (
    <ComponentCard
      title={student ? `Edit Student (${student.student_code})` : "Add Student"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert type="error" message={error} />

        {!student && (
          <SourceBanner
            sourceLabel="Admissions"
            picked={
              fromAdmission
                ? `${fromAdmission.admission_no} · ${fromAdmission.student_name}`
                : null
            }
            hint="Adding an admitted student? Pick the admission to fill the details automatically."
            onPick={() => setPickerOpen(true)}
            onClear={() => setFromAdmission(null)}
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="First Name"
            required
            error={errors.first_name?.message}
          >
            <Input {...register("first_name")} placeholder="First name" />
          </FormField>
          <FormField label="Last Name">
            <Input {...register("last_name")} placeholder="Last name" />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="info@gmail.com"
            />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <PhoneInput {...register("phone")} placeholder="Phone number" />
          </FormField>
          <FormField label="Date of Birth">{dateField("dob")}</FormField>
          <FormField label="Admission Date">
            {dateField("admission_date")}
          </FormField>
          <FormField label="Address" className="md:col-span-2">
            <Textarea {...register("address")} rows={3} placeholder="Address" />
          </FormField>
          <FormField label="Course" required error={errors.course_id?.message}>
            <Controller
              control={control}
              name="course_id"
              render={({ field }) => (
                <SelectBox
                  options={courseOptions}
                  value={field.value}
                  placeholder="Select Course"
                  invalid={Boolean(errors.course_id)}
                  onChange={(v) => {
                    field.onChange(v);
                    const c = courses.find((x) => String(x.id) === v);
                    if (c?.duration_id)
                      setValue("duration_id", String(c.duration_id));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Duration">
            <Controller
              control={control}
              name="duration_id"
              render={({ field }) => (
                <SelectBox
                  options={durationOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Duration"
                />
              )}
            />
          </FormField>
          <FormField label="Discount Type">
            <Controller
              control={control}
              name="discount_type"
              render={({ field }) => (
                <SelectBox
                  options={DISCOUNT_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
          <FormField
            label="Discount Value"
            error={errors.discount_value?.message}
          >
            <Input
              {...register("discount_value")}
              inputMode="decimal"
              placeholder={
                discountType === "percentage" ? "e.g. 10 (%)" : "e.g. 500"
              }
            />
          </FormField>
          <FormField label="Photo (max 10MB)" error={photoError}>
            <PhotoInput
              file={photo}
              existingUrl={fileUrl(student?.photo || fromAdmission?.photo)}
              onChange={(f, err) => {
                setPhoto(f);
                setPhotoError(err);
              }}
            />
          </FormField>
        </div>

        <FeeSummary fee={fee} discount={discount} total={total} />

        {/* Student portal login: Student ID + this password */}
        <div className="space-y-5 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Student Portal Login
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The student signs in on the normal login page (
              <span className="font-medium">/signin</span>) with their Student
              ID
              {student
                ? ` (${student.student_code})`
                : " (created after saving)"}{" "}
              and this password.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={
                student ? "New Password (leave blank to keep)" : "Password"
              }
              required={!student}
              error={errors.password?.message}
            >
              <Input
                {...register("password")}
                type="password"
                autoComplete="new-password"
                placeholder="Min 6 characters"
              />
            </FormField>
            <FormField
              label={student ? "Re-enter New Password" : "Re-enter Password"}
              required={!student}
              error={errors.confirm_password?.message}
            >
              <Input
                {...register("confirm_password")}
                type="password"
                autoComplete="new-password"
                placeholder="Same password again"
              />
            </FormField>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Portal menus this student can open
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <Checkbox checked disabled aria-label="Dashboard" /> Dashboard
                (always)
              </label>
              {PORTAL_MENU_OPTIONS.map((m) => (
                <label
                  key={m.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <Checkbox
                    checked={menus.includes(m.key)}
                    onCheckedChange={(on) =>
                      setMenus((cur) =>
                        on ? [...cur, m.key] : cur.filter((x) => x !== m.key),
                      )
                    }
                    aria-label={m.label}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/students")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : student
                ? "Update Student"
                : "Save Student"}
          </Button>
        </div>
      </form>

      <RecordPickerDialog<Admission>
        open={pickerOpen}
        title="Select from Admissions"
        searchPlaceholder="Search name, father, phone, email or admission no"
        load={(search) => admissionService.list({ search })}
        toRow={(r) => ({
          id: r.id,
          title: r.student_name,
          subtitle: [
            r.father_name && `S/o ${r.father_name}`,
            r.phone,
            r.course_name,
          ]
            .filter(Boolean)
            .join(" · "),
          meta: `#${r.admission_no} · ${formatDate(r.admission_date)}`,
          photo: r.photo ? fileUrl(r.photo) : undefined,
          badge:
            r.status === "Pending"
              ? { label: "Pending", color: "warning" }
              : { label: "Confirmed", color: "success" },
        })}
        onUse={applyAdmission}
        onClose={() => setPickerOpen(false)}
      />
    </ComponentCard>
  );
}
