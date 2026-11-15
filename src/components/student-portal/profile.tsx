"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon } from "@/icons";
import { saveStudentToken } from "@/lib/auth";
import { fileUrl } from "@/lib/config";
import { errorMessage, formatDate } from "@/lib/format";
import { studentPortalService } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStudent } from "./context";
import InfoRow from "./info-row";

const schema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please re-enter the new password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
type FormData = z.infer<typeof schema>;

export default function StudentProfile() {
  const { me } = useStudent();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    try {
      const res = await studentPortalService.changePassword(data);
      saveStudentToken(res.token); // this device stays signed in; other devices are signed out
      reset();
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  if (!me) return null;
  const { student, profile } = me;
  const photo = fileUrl(student.photo);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <ComponentCard title="My Profile" className="xl:col-span-3">
        <div className="flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="size-full object-cover" />
            ) : (
              <UserIcon className="size-10 text-gray-400" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-gray-800 dark:text-white/90">
              {student.full_name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Student ID: {student.student_code}
            </p>
          </div>
        </div>
        {profile && (
          <div className="-my-3">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow
              label="Date of Birth"
              value={profile.dob ? formatDate(profile.dob) : "-"}
            />
            <InfoRow
              label="Admission Date"
              value={
                profile.admission_date
                  ? formatDate(profile.admission_date)
                  : "-"
              }
            />
            <InfoRow label="Address" value={profile.address} />
          </div>
        )}
      </ComponentCard>

      <ComponentCard title="Change Password" className="xl:col-span-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <FormAlert
            type={message?.type ?? "success"}
            message={message?.text}
          />
          <FormField
            label="Current Password"
            required
            error={errors.current_password?.message}
          >
            <Input
              {...register("current_password")}
              type="password"
              autoComplete="current-password"
            />
          </FormField>
          <FormField
            label="New Password"
            required
            error={errors.new_password?.message}
          >
            <Input
              {...register("new_password")}
              type="password"
              autoComplete="new-password"
              placeholder="Min 6 characters"
            />
          </FormField>
          <FormField
            label="Re-enter New Password"
            required
            error={errors.confirm_password?.message}
          >
            <Input
              {...register("confirm_password")}
              type="password"
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Saving..." : "Change Password"}
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}
